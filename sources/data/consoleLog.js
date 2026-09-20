import * as THREE from 'three/webgpu'

const text = `
╔═ KAUAN KELVIN ═══════════════════════════════════════╗
║ Obrigado por visitar meu portfólio, pessoa curiosa!  ║
║ Estudante de Engenharia de Software · Brasil         ║
╚═══════════════════════════════════════════════════════╝

╔═ Contato ════════════════════════════════════════════╗
║ E-mail    ⇒ kelvinkauan722@gmail.com                 ║
║ Instagram ⇒ https://instagram.com/kauan_kelvin45     ║
║ GitHub    ⇒ https://github.com/kauankelvin7          ║
║ LinkedIn  ⇒ https://linkedin.com/in/kauan-kelvin     ║
║ Portfólio ⇒ https://kauankelvindev.vercel.app        ║
╚═══════════════════════════════════════════════════════╝

╔═ Stack ══════════════════════════════════════════════╗
║ Back-end   ⇒ Java, Spring Boot, Python, Node.js      ║
║ Front-end  ⇒ React, TypeScript, Next.js, Three.js    ║
║ Dados      ⇒ PostgreSQL, MySQL, Firebase             ║
║ Automação  ⇒ Python, Selenium, OpenPyXL              ║
║ Three.js   ⇒ revisão ${THREE.REVISION}               ║
╚═══════════════════════════════════════════════════════╝

╔═ Depuração ══════════════════════════════════════════╗
║ Adicione #debug ao fim da URL e recarregue.          ║
║ Pressione [V] para alternar a câmera livre.          ║
╚═══════════════════════════════════════════════════════╝
`

let finalText = ''
let finalStyles = []
const stylesSet = {
    letter: 'color: #ffffff; font: 400 1em monospace;',
    pipe: 'color: #D66FFF; font: 400 1em monospace;',
}
let currentStyle = null

for(let i = 0; i < text.length; i++)
{
    const char = text[i]
    const style = char.match(/[╔║═╗╚╝╔╝]/) ? 'pipe' : 'letter'

    if(style !== currentStyle)
    {
        currentStyle = style
        finalText += '%c'
        finalStyles.push(stylesSet[currentStyle])
    }

    finalText += char
}

export default [finalText, ...finalStyles]
