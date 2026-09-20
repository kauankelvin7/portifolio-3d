# Portfólio 3D | Kauan Kelvin

![Prévia do portfólio](./static/social/share-image.png)

Portfólio interativo de Kauan Kelvin, estudante de Engenharia de Software e desenvolvedor back-end. O site transforma projetos, trajetória e contatos em um mundo 3D que pode ser explorado de carro.

## Sobre o projeto

O portfólio reúne meus projetos mais bem documentados do GitHub em áreas navegáveis. A apresentação combina interface web, física em tempo real, modelos 3D, áudio e pequenas conquistas espalhadas pelo mapa.

O conteúdo está em português e foi adaptado à minha identidade, com tons de verde, textos próprios, projetos reais e links atualizados.

## Recursos

- Mundo 3D renderizado com WebGL ou WebGPU
- Veículo com física, colisões e suporte a teclado, mouse, controle e toque
- Áreas de projetos, laboratório, carreira, contatos e conquistas
- Ciclo de dia, clima, áudio e efeitos visuais
- Interface responsiva integrada ao ambiente 3D
- Estátuas personalizadas para Instagram, GitHub, LinkedIn, e-mail e portfólio

## Tecnologias

- JavaScript e módulos ES
- Three.js e WebGPU
- Rapier 3D
- GSAP e Howler.js
- Vite e Stylus
- Blender, glTF, GLB e KTX

## Executar localmente

Use uma versão atual do Node.js. Depois, instale as dependências e inicie o ambiente de desenvolvimento:

```bash
npm install --force
npm run dev
```

Para gerar os arquivos de produção:

```bash
npm run build
```

## Verificações

```bash
npm run verify:static
npm run verify:social
```

`verify:static` confere imports, imagens, arquivos da interface e o limite de tamanho do GitHub. `verify:social` valida as esculturas personalizadas nos modelos 3D normal e comprimido.

## Estrutura

- `sources/`: código e interface
- `sources/data/`: projetos, laboratório, conquistas e links
- `static/`: modelos, imagens, texturas, sons e arquivos públicos
- `resources/`: arquivos-fonte usados na produção dos assets
- `scripts/`: compressão e verificações estáticas

## Contato

- [GitHub](https://github.com/kauankelvin7)
- [LinkedIn](https://www.linkedin.com/in/kauan-kelvin/)
- [Instagram](https://www.instagram.com/kauan_kelvin45)
- [E-mail](mailto:kelvinkauan722@gmail.com)

## Créditos e licença

Este projeto foi baseado no [Folio 2025](https://github.com/brunosimon/folio-2025), de Bruno Simon, distribuído sob a licença MIT. O aviso de copyright original foi preservado em [license.md](./license.md).

Modificações e identidade desta versão: Kauan Kelvin, 2026.
