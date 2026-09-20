import * as THREE from 'three/webgpu'
import { Game } from '../../Game.js'
import { InteractivePoints } from '../../InteractivePoints.js'
import socialData from '../../../data/social.js'
import { InstancedGroup } from '../../InstancedGroup.js'
import { Area } from './Area.js'
import { View } from '../../View.js'

export class SocialArea extends Area
{
    constructor(model)
    {
        super(model)

        this.center = this.references.items.get('center')[0].position

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '👨‍🦲 Social',
                expanded: false,
            })
        }

        this.setLinks()
        this.setCustomIcons()
        this.setFans()
        this.setVisitors()
        this.setStatue()
        // this.setFWA()
        this.setAchievement()
    }

    setLinks()
    {
        const radius = 6
        for(const link of socialData)
        {
            const angle = link.slot * Math.PI / 7
            const position = this.center.clone()
            position.x += Math.cos(angle) * radius
            position.y = 1
            position.z -= Math.sin(angle) * radius

            this.interactivePoint = this.game.interactivePoints.create(
                position,
                link.name,
                link.align === 'left' ? InteractivePoints.ALIGN_LEFT : InteractivePoints.ALIGN_RIGHT,
                InteractivePoints.STATE_CONCEALED,
                () =>
                {
                    if(link.url)
                        window.open(link.url, '_blank', 'noopener,noreferrer')
                    else if(link.modal)
                        this.game.modals.open(link.modal)
                },
                () =>
                {
                    this.game.inputs.interactiveButtons.addItems(['interact'])
                },
                () =>
                {
                    this.game.inputs.interactiveButtons.removeItems(['interact'])
                },
                () =>
                {
                    this.game.inputs.interactiveButtons.removeItems(['interact'])
                }
            )
            
        }
    }

    setCustomIcons()
    {
        const invisibleMaterial = new THREE.MeshBasicNodeMaterial({ visible: false })
        const statueMaterial = this.game.materials.getFromName('palette')

        // Objects.getFromModel changes .name for physics. GLTFLoader preserves
        // the original model identifier in userData.name.
        const findCarrierItem = (name) => this.objects.items
            .find((item) => item.visual?.object3D.userData.name === name)

        const findCarrier = (name) => findCarrierItem(name)?.visual.object3D

        const hideCarrier = (name) =>
        {
            const item = findCarrierItem(name)
            if(!item)
                return

            item.visual.object3D.visible = false
            item.physical?.body.setEnabled(false)
            this.objects.hideable = this.objects.hideable.filter((object3D) => object3D !== item.visual.object3D)
        }

        hideCarrier('blueskyPhysicalDynamic.001')
        hideCarrier('youtubePhysicalDynamic')
        hideCarrier('twitchPhysicalDynamic')

        const applyStatuePalette = (geometry) =>
        {
            const uv = geometry.attributes.uv
            for(let i = 0; i < uv.count; i++)
                uv.setXY(i, 0.421, 0.5)
            uv.needsUpdate = true
            return geometry
        }

        const createBar = (width, height, depth, x, y, rotation = 0) =>
        {
            const geometry = applyStatuePalette(new THREE.BoxGeometry(width, height, depth))
            const mesh = new THREE.Mesh(geometry, statueMaterial)
            mesh.position.set(x, y, 0)
            mesh.rotation.z = rotation
            mesh.castShadow = true
            mesh.receiveShadow = true
            return mesh
        }

        const instagramCarrier = findCarrier('xPhysicalDynamic')
        if(instagramCarrier)
        {
            instagramCarrier.material = invisibleMaterial

            const icon = new THREE.Group()
            icon.name = 'instagramIcon'
            icon.add(
                createBar(1.24, 0.16, 0.22, 0, 0.62),
                createBar(1.24, 0.16, 0.22, 0, -0.62),
                createBar(0.16, 1.08, 0.22, -0.54, 0),
                createBar(0.16, 1.08, 0.22, 0.54, 0),
            )

            const lensGeometry = applyStatuePalette(new THREE.TorusGeometry(0.28, 0.08, 8, 24))
            const lens = new THREE.Mesh(lensGeometry, statueMaterial)
            lens.position.z = 0.14
            lens.castShadow = true
            lens.receiveShadow = true
            icon.add(lens)

            const indicatorGeometry = applyStatuePalette(new THREE.SphereGeometry(0.08, 12, 8))
            const indicator = new THREE.Mesh(indicatorGeometry, statueMaterial)
            indicator.position.set(0.32, 0.34, 0.14)
            indicator.castShadow = true
            indicator.receiveShadow = true
            icon.add(indicator)

            instagramCarrier.add(icon)
        }

        const portfolioCarrier = findCarrier('discordPhysicalDynamic')
        if(portfolioCarrier)
        {
            portfolioCarrier.material = invisibleMaterial

            const icon = new THREE.Group()
            icon.name = 'portfolioIcon'
            icon.add(
                createBar(0.55, 0.14, 0.22, -0.28, 0.18, Math.PI * 0.25),
                createBar(0.55, 0.14, 0.22, -0.28, -0.18, - Math.PI * 0.25),
                createBar(0.55, 0.14, 0.22, 0.28, 0.18, - Math.PI * 0.25),
                createBar(0.55, 0.14, 0.22, 0.28, -0.18, Math.PI * 0.25),
                createBar(0.9, 0.12, 0.22, 0, 0, - Math.PI * 0.35),
            )
            portfolioCarrier.add(icon)
        }

        const visitorsCarrier = findCarrier('onlyfansPhysicalDynamic')
        if(visitorsCarrier)
        {
            visitorsCarrier.material = invisibleMaterial

            const icon = new THREE.Group()
            icon.name = 'visitorsIcon'

            const bodyGeometry = applyStatuePalette(new THREE.CapsuleGeometry(0.3, 0.5, 4, 16))
            const body = new THREE.Mesh(bodyGeometry, statueMaterial)
            body.position.set(0, -0.22, 0)
            body.castShadow = true
            body.receiveShadow = true
            icon.add(body)

            const headGeometry = applyStatuePalette(new THREE.SphereGeometry(0.25, 16, 12))
            const head = new THREE.Mesh(headGeometry, statueMaterial)
            head.position.set(0, 0.62, 0)
            head.castShadow = true
            head.receiveShadow = true
            icon.add(head)

            visitorsCarrier.add(icon)
        }
    }

    setFans()
    {
        const baseFan = this.references.items.get('fan')[0]
        baseFan.castShadow = true
        baseFan.receiveShadow = true

        baseFan.position.set(0, 0, 0)

        // Update materials 
        this.game.materials.updateObject(baseFan)

        baseFan.removeFromParent()
        
        this.fans = {}
        this.fans.spawnerPosition = this.references.items.get('onlyFans')[0].position
        this.fans.count = 30
        this.fans.visibleCount = 0
        this.fans.currentIndex = 0
        this.fans.mass = 0.02
        this.fans.objects = []

        const references = []

        for(let i = 0; i < this.fans.count; i++)
        {
            // Reference
            const reference = new THREE.Object3D()

            reference.position.copy(this.fans.spawnerPosition)
            reference.position.y += 99
            reference.needsUpdate = true
            references.push(reference)
            
            // Object
            const object = this.game.objects.add(
                {
                    model: reference,
                    updateMaterials: false,
                    castShadow: false,
                    receiveShadow: false,
                    parent: null,
                },
                {
                    type: 'dynamic',
                    position: reference.position,
                    rotation: reference.quaternion,
                    friction: 0.7,
                    mass: this.fans.mass,
                    sleeping: true,
                    enabled: false,
                    colliders: [ { shape: 'cuboid', parameters: [ 0.45, 0.65, 0.45 ], category: 'object' } ],
                    waterGravityMultiplier: - 1
                },
            )

            this.fans.objects.push(object)
        }

        this.fans.instancedGroup = new InstancedGroup(references, baseFan)

        this.fans.pop = () =>
        {
            const object = this.fans.objects[this.fans.currentIndex]

            const spawnPosition = this.fans.spawnerPosition.clone()
            spawnPosition.x += (Math.random() - 0.5) * 4
            spawnPosition.y += 4 * Math.random()
            spawnPosition.z += (Math.random() - 0.5) * 4
            object.physical.body.setTranslation(spawnPosition)
            object.physical.body.setEnabled(true)
            object.physical.body.setLinvel({ x: 0, y: 0, z: 0 })
            object.physical.body.setAngvel({ x: 0, y: 0, z: 0 })
            object.physical.body.wakeUp()
            // this.game.ticker.wait(1, () =>
            // {
            //     object.physical.body.applyImpulse({
            //         x: (Math.random() - 0.5) * this.fans.mass * 2,
            //         y: Math.random() * this.fans.mass * 3,
            //         z: this.fans.mass * 7
            //     }, true)
            //     object.physical.body.applyTorqueImpulse({ x: 0, y: 0, z: 0 }, true)
            // })

            this.fans.currentIndex = (this.fans.currentIndex + 1) % this.fans.count

            this.fans.visibleCount = Math.min(this.fans.visibleCount + 1, this.fans.count)

            // Sound
            this.game.audio.groups.get('click').play(true)

            // Achievement
            this.game.achievements.setProgress('fan', 1)
        }
    }

    setVisitors()
    {
        const interactiveArea = this.game.interactivePoints.create(
            this.references.items.get('onlyFans')[0].position,
            'Visitantes',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.fans.pop()
            },
            () =>
            {
                this.game.inputs.interactiveButtons.addItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            }
        )
    }

    setStatue()
    {
        this.statue = {}
        this.statue.body = this.references.items.get('statue')[0].userData.object.physical.body
        this.statue.down = false
    }

    setFWA()
    {
        this.fwa = {}

        // Confetti
        let i = 0
        this.fwa.positions = [
            new THREE.Vector3(23.5, 0, -18.5),
            new THREE.Vector3(27, 0, -19.5),
        ]
        const pop = () =>
        {
            i++
            const position = this.fwa.positions[i % this.fwa.positions.length]
            this.game.world.confetti.pop(position)
            
            setTimeout(pop, 500 + Math.random() * 1500)
        }
        setTimeout(pop, 2000)
        
        // Interactive points
        game.interactivePoints.temporaryHide()

        // Input => start
        this.game.inputs.addActions([
            { name: 'startFWA', categories: [ 'intro', 'modal', 'menu', 'racing', 'cinematic', 'wandering' ], keys: [ 'Keyboard.k' ] },
            { name: 'winFWA', categories: [ 'intro', 'modal', 'menu', 'racing', 'cinematic', 'wandering' ], keys: [ 'Keyboard.j' ] },
        ])
        this.game.inputs.events.on('startFWA', (action) =>
        {
            if(action.active)
            {
                // View
                game.view.zoom.baseRatio = 0.55
                game.view.zoom.ratio = 0.55
                game.view.zoom.smoothedRatio = 0.55
                game.view.focusPoint.position.set(25, 0, -19.2)
                game.view.focusPoint.isTracking = false
                window.setTimeout(() =>
                {
                    this.game.view.setMode(View.MODE_FREE)
                }, 1000)

                // Weather
                this.game.weather.override.start(
                    {
                        humidity: 0,
                        electricField: 0,
                        clouds: 0,
                        wind: 0
                    },
                    0
                )
        
                // Day cycles
                this.game.dayCycles.override.start(
                    {
                        progress: 0.87
                    },
                    0
                )
                
                // Buttons
                document.querySelector('.js-menu-trigger').style.display = 'none'
                document.querySelector('.js-map-trigger').style.display = 'none'
            }
        })
        this.game.inputs.events.on('winFWA', (action) =>
        {
            if(action.active)
            {
                this.game.achievements.setProgress('foty', 1)
            }
        })
    }

    setAchievement()
    {
        this.events.on('boundingIn', () =>
        {
            this.game.achievements.setProgress('areas', 'social')
        })
    }

    update()
    {
        if(this.fans.visibleCount)
        {
            let allFansSleeping = true
            for(const fan of this.fans.objects)
                allFansSleeping = allFansSleeping && fan.physical.body.isSleeping()

            if(!allFansSleeping)
                this.fans.instancedGroup.updateBoundings()
        }
    
        if(this.statue && !this.statue.down && !this.statue.body.isSleeping())
        {
            const statueUp = new THREE.Vector3(0, 1, 0)
            statueUp.applyQuaternion(this.statue.body.rotation())
            if(statueUp.y < 0.25)
            {
                this.statue.down = true
                this.game.achievements.setProgress('statueDown', 1)
            }
        }

        for(const object of this.fans.objects)
        {
            if(!object.physical.body.isSleeping() && object.physical.body.isEnabled())
                object.visual.object3D.needsUpdate = true
        }
    }
}
