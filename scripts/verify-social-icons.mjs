// CPU-only regression check. Run: node --experimental-vm-modules scripts/verify-social-icons.mjs
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import * as THREE from 'three/webgpu'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import draco from 'draco3dgltf'

// Load the real area/object code without starting Game, a renderer or a server.
const game = {}
const modules = new Map()
const stubs = {
    'Game.js': { Game: { getInstance: () => game } },
    'InteractivePoints.js': { InteractivePoints: {} },
    'InstancedGroup.js': { InstancedGroup: class {} },
    'View.js': { View: class {} },
}
async function loadModule(url)
{
    if(modules.has(url)) return modules.get(url)
    const exports = url === 'three/webgpu' ? THREE : stubs[url.split('/').at(-1)]
    const module = exports
        ? new vm.SyntheticModule(Object.keys(exports), function() {
            for(const [key, value] of Object.entries(exports)) this.setExport(key, value)
        }, { identifier: url })
        : new vm.SourceTextModule(await readFile(new URL(url), 'utf8'), { identifier: url })
    modules.set(url, module)
    await module.link((specifier, parent) => loadModule(
        specifier.startsWith('.') ? new URL(specifier, parent.identifier).href : specifier
    ))
    return module
}
const objectsModule = await loadModule(new URL('../sources/Game/Objects.js', import.meta.url).href)
await objectsModule.evaluate()
const socialModule = await loadModule(new URL('../sources/Game/World/Areas/SocialArea.js', import.meta.url).href)
await socialModule.evaluate()
const { Objects } = objectsModule.namespace
const { SocialArea } = socialModule.namespace
const areaModule = modules.get(new URL('../sources/Game/World/Areas/Area.js', import.meta.url).href)
const { Area } = areaModule.namespace

const palette = new THREE.MeshBasicNodeMaterial()
game.scene = new THREE.Scene()
game.ticker = { events: { on() {} }, wait: (_delay, callback) => callback() }
game.zones = { create: () => ({ events: { on() {} } }) }
game.materials = { updateObject() {}, getFromName: () => palette }
game.physics = {
    getPhysical(description) {
        let enabled = description.enabled ?? true
        const position = description.position.clone()
        const rotation = description.rotation.clone()
        return {
            type: description.type,
            initialState: { position: position.clone(), rotation: rotation.clone(), sleeping: true },
            body: {
                translation: () => position,
                rotation: () => rotation,
                isEnabled: () => enabled,
                setEnabled: (value) => { enabled = value },
                setTranslation: (value) => position.copy(value),
                setRotation: (value) => rotation.copy(value),
                setLinvel() {}, setAngvel() {}, resetForces() {}, resetTorques() {}, sleep() {},
            },
        }
    },
}

// Skip image decoding. Meshes, transforms, names and hierarchy use GLTFLoader.
const loader = new GLTFLoader()
loader.register((parser) => ({
    name: 'HEADLESS_MATERIALS',
    loadMaterial: (index) => Promise.resolve(new THREE.MeshStandardMaterial({
        name: parser.json.materials[index].name,
    })),
}))
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
    'draco3d.decoder': await draco.createDecoderModule(),
})

for(const filename of ['areas.glb', 'areas-compressed.glb'])
{
    const file = new URL(`../static/areas/${filename}`, import.meta.url)
    let binary = await readFile(file)
    if(filename.includes('compressed'))
    {
        // Decode the shipped compressed geometry in memory, without GPU/Worker APIs.
        const document = await io.read(fileURLToPath(file))
        document.getRoot().listExtensionsUsed()
            .find((extension) => extension.extensionName === 'KHR_draco_mesh_compression')?.dispose()
        binary = await io.writeBinary(document)
    }
    const gltf = await loader.parseAsync(binary.buffer.slice(binary.byteOffset, binary.byteOffset + binary.byteLength), '')
    const model = gltf.scene.getObjectByName('social')
    assert.ok(model, `${filename}: social area exists`)
    game.objects = new Objects()
    const area = new Area(model)
    const find = (name) => area.objects.items.find((item) => item.visual?.object3D.userData.name === name)
    const x = find('xPhysicalDynamic')
    const discord = find('discordPhysicalDynamic')
    const visitors = find('onlyfansPhysicalDynamic')
    assert.equal(x.visual.object3D.name, 'x')
    assert.equal(discord.visual.object3D.name, 'discord')
    const originalGeometry = x.visual.object3D.geometry

    SocialArea.prototype.setCustomIcons.call(area)
    for(const [item, iconName] of [[x, 'instagramIcon'], [discord, 'portfolioIcon'], [visitors, 'visitorsIcon']])
    {
        const carrier = item.visual.object3D
        assert.equal(carrier.material.visible, false, `${filename}: original logo hidden`)
        const icon = carrier.getObjectByName(iconName)
        assert.ok(icon?.children.length, `${filename}: ${iconName} exists`)
        assert.equal(icon.parent, carrier, 'replacement follows the physical carrier')
        icon.traverse((child) => {
            if(!child.isMesh) return
            assert.equal(child.material, palette)
            assert.equal(child.material.visible, true)
            assert.ok(child.geometry.attributes.position.count > 0)
        })
        assert.equal(item.physical.body.isEnabled(), true)
    }
    assert.equal(x.visual.object3D.geometry, originalGeometry, 'original GPU geometry is not mutated')
    game.objects.resetAll()
    for(const name of ['blueskyPhysicalDynamic.001', 'youtubePhysicalDynamic', 'twitchPhysicalDynamic'])
    {
        const item = find(name)
        assert.ok(item, `${filename}: ${name} exists`)
        assert.equal(item.visual.object3D.visible, false, `${filename}: unused logo stays hidden after reset`)
        assert.equal(item.physical.body.isEnabled(), false, `${filename}: no invisible obstacle after reset`)
        assert.ok(!area.objects.hideable.includes(item.visual.object3D))
    }
    for(const name of ['gitHubPhysicalDynamic', 'linkedInPhysicalDynamic', 'mailPhysicalDynamic'])
    {
        assert.equal(find(name).visual.object3D.material.visible, true, `${filename}: active logo preserved`)
    }
    console.log(`${filename}: Instagram, portfólio e visitantes; material e física social OK`)
    game.scene.clear()
}
