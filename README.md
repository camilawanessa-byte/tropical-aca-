# Tropical Açaí

Site estático da Tropical Açaí com:

- Cardápio interativo
- Carrinho e finalização pelo WhatsApp
- Programa fidelidade digital
- Painel administrativo local para preços, cadastro e pausa de produtos

## Publicar pelo GitHub Pages

1. Crie um repositório no GitHub.
2. Envie todos os arquivos desta pasta para o repositório.
3. No GitHub, abra `Settings`.
4. Entre em `Pages`.
5. Em `Build and deployment`, selecione:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
6. Clique em `Save`.
7. Aguarde o GitHub gerar o link público.

O site principal abre pelo arquivo `index.html`.

## Acesso administrativo

- Usuário: `admin`
- Senha: `tropical123`

Observação: o painel administrativo atual salva alterações no navegador usando `localStorage`. Para uso real com vários dispositivos, o próximo passo é conectar o projeto a um banco de dados e autenticação, como Supabase.
