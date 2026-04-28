# 🌌 SGLM-O: Sistema de Gestão de Lore e Mídias Offline

Bem-vindo ao **SGLM-O**, o motor do "Projeto Universo". Este sistema foi arquitetado para ser **100% offline**, sem necessidade de servidores, bancos de dados ou configurações complexas. Você gerencia o conteúdo editando arquivos simples e organizando pastas.

## 🚀 Como Usar o Indexador da Galeria

Para evitar que você tenha que digitar o nome de cada foto manualmente no código, o sistema possui um robô indexador.

1. Navegue até a pasta `assets/gallery/`.
2. Crie subpastas. **Cada subpasta será tratada como um Álbum**.
   - Exemplo: `assets/gallery/Concept Arts/`
3. Coloque suas fotos (`.jpg`, `.png`, `.webp`) dentro destas subpastas.
4. Volte para a raiz do projeto e dê um **clique duplo** no arquivo `atualizar-galeria.bat`.
5. O terminal abrirá rapidamente, lerá todas as fotos e criará/atualizará o arquivo `js/gallery-data.js` automaticamente.
6. Recarregue a página `galeria.html` no seu navegador e os novos álbuns já estarão lá!

### Alterando a Raridade dos Álbuns (Opcional)
Por padrão, todo álbum criado pelo indexador terá raridade "common". Se você quiser que o sistema aplique cores e efeitos de raridade automaticamente, adicione um **sufixo especial no nome da pasta**:
- `Minha Pasta__rare` (Azul Cristalino)
- `Minha Pasta__epic` (Roxo Místico)
- `Minha Pasta__legendary` (Dourado Cetim)
- `Minha Pasta__aurora` (Degradê Animado)

*O sistema irá ler o sufixo, aplicar a raridade e limpar o nome do álbum na tela (exibindo apenas "Minha Pasta").*

---

## 📂 Estrutura de Pastas e Mídias

Para garantir que o layout "Premium Minimalist" nunca quebre, siga rigorosamente esta estrutura:

* `/assets/ui/`: Logos, ícones e banners estáticos do site.
* `/assets/characters/{id_do_personagem}/`: (Ex: `/assets/characters/aurora/`)
  - Aqui ficam as imagens de perfil e retrato de cada personagem.
* `/assets/mangas/{numero_do_capitulo}/`: (Ex: `/assets/mangas/01/`)
  - Crie pastas para cada capítulo.
  - Coloque as páginas do mangá numeradas sequencialmente (ex: `01.jpg`, `02.jpg`, etc). O Leitor Avançado fará o empilhamento automático.
* `/assets/gallery/`: (Como explicado acima, para a Galeria Dinâmica).

---

## 📏 Guia Definitivo de Proporções (MUITO IMPORTANTE)

Para que a UI/UX se mantenha blindada, por favor, corte/exporte suas imagens nestas proporções recomendadas antes de colocá-las nas pastas:

1. **Hero Banner da Home**
   - **Proporção:** 21:9 (Ultrawide)
   - **Recomendado:** 2560x1080px.
   - *Onde fica?* Definido na chave `bannerHome` dentro de `js/database.js` (ou `assets/ui/hero-banner.png`).

2. **Card do Panteão (Personagens)**
   - **Proporção:** 3:4 (Retrato Vertical)
   - **Recomendado:** 900x1200px.
   - *Onde fica?* Na chave `portrait` dentro de cada objeto de Personagem no `database.js`.

3. **Avatar / Pop-out da Citação (Quote Engine)**
   - **Proporção:** 1:1 (Quadrado)
   - **Formato:** PNG com fundo transparente.
   - **Recomendado:** 800x800px.
   - *Onde fica?* Na chave `pfp` dentro de cada objeto de Personagem no `database.js`.

4. **Capas e Fotos da Galeria**
   - O SGLM-O é inteligente: O código CSS fará um recorte (Crop) perfeito de `1:1` para exibir as fotos no grid da galeria, independentemente do tamanho original que você enviar.
   - Ao clicar na foto (Photo Viewer Modal), o sistema exibirá a foto em seu tamanho e aspecto original (Landscape ou Portrait). Portanto, suba as artes na melhor qualidade possível!

---

## ⚙️ O Painel de Controle: `js/database.js`

Este é o "Cérebro Manual" do projeto. Nele você edita o texto do site, as lores dos personagens e a configuração global:

- `corPrimaria`: Altere a cor hexadecimal (ex: `#E32A73`) e todo o site (botões, detalhes) mudará de cor dinamicamente.
- `nomeSite`: O título do seu projeto.
- `statusCriador`: A mensagem de atualização que aparece na Home.
- `CHARACTERS`: Copie, cole e altere os blocos para criar "Novas Garotas". O site gerará a página de perfil delas automaticamente.
- `SEASONS`: Adicione os caminhos das páginas do seu mangá no array `chapterPaths` para o Leitor Avançado carregar.

---
*Divirta-se criando seu Universo!*
