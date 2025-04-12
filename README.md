

# Camagru

## project structure
```bash
camagru/
├── index.php                 # Arquivo principal (ponto de entrada)
├── config/
│   └── database.php          # Arquivo de configuração de banco de dados
├── includes/
│   ├── header.php            # Cabeçalho, com menu e links de navegação
│   ├── footer.php            # Rodapé, com informações de copyright e links extras
│   └── functions.php         # Funções reutilizáveis no projeto
├── pages/
│   ├── home.php              # Página inicial
│   ├── login.php             # Página de login
│   ├── register.php          # Página de registro
│   ├── gallery.php           # Página da galeria
│   ├── editor.php            # Página do editor de imagens
│   └── profile.php           # Página de perfil do usuário
├── public/
│   ├── css/                  # Arquivos de estilos (CSS)
│   ├── js/                   # Arquivos JavaScript
│   └── uploads/              # Onde as imagens editadas dos usuários são salvas
└── .env                      # Arquivo para configurações e variáveis de ambiente
```

## env structure
```bash
MYSQL_ROOT_PASSWORD=
MYSQL_DATABASE=
MYSQL_USER=
MYSQL_PASSWORD=
```

