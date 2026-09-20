import assert from 'node:assert/strict'
import { access, readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import projects from '../sources/data/projects.js'
import lab from '../sources/data/lab.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const failures = []
const checkFile = async (relative, reason) =>
{
    try { await access(path.join(root, relative)) }
    catch { failures.push(`${reason}: ${relative}`) }
}

for(const project of projects)
    for(const image of project.images)
        await checkFile(`static/projects/images/${image}`, `Projeto ${project.title}`)

for(const item of lab)
{
    await checkFile(`static/lab/images/${item.image}`, `Laboratório ${item.title}`)
    await checkFile(`static/lab/images/${item.imageMini}`, `Miniatura ${item.title}`)
}

const walk = async (directory) =>
{
    const files = []
    for(const entry of await readdir(directory, { withFileTypes: true }))
    {
        const fullPath = path.join(directory, entry.name)
        if(entry.isDirectory()) files.push(...await walk(fullPath))
        else files.push(fullPath)
    }
    return files
}

for(const file of (await walk(path.join(root, 'sources'))).filter((item) => item.endsWith('.js')))
{
    const source = await readFile(file, 'utf8')
    for(const match of source.matchAll(/(?:import|export)\s+(?:[^'";]*?\s+from\s+)?['"](\.[^'"]+)['"]/g))
    {
        const target = path.resolve(path.dirname(file), match[1])
        try { await access(target) }
        catch { failures.push(`Import ausente em ${path.relative(root, file)}: ${match[1]}`) }
    }
}

const html = await readFile(path.join(root, 'sources/index.html'), 'utf8')
for(const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g))
{
    const reference = match[1]
    if(/^(?:https?:|mailto:|#)/.test(reference)) continue
    const normalized = reference.replace(/^\.\//, '').replace(/^\//, '')
    const relative = normalized.startsWith('style/') || normalized === 'index.js'
        ? `sources/${normalized}`
        : `static/${normalized}`
    await checkFile(relative, 'Referência do HTML')
}

const publishableFiles = [
    ...await walk(path.join(root, 'resources')),
    ...await walk(path.join(root, 'sources')),
    ...await walk(path.join(root, 'static')),
].filter((file) => !file.includes(`${path.sep}original-public-assets${path.sep}`) && !file.endsWith('.blend1'))
for(const file of publishableFiles)
{
    const size = (await stat(file)).size
    if(size >= 100 * 1024 * 1024)
        failures.push(`Arquivo excede 100 MiB: ${path.relative(root, file)}`)
}

assert.deepEqual(failures, [], failures.join('\n'))
console.log(`Assets: ${projects.length} projetos e ${lab.length} itens do laboratório OK`)
console.log('Imports relativos, referências do HTML e limite de 100 MiB: OK')
