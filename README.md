# Open Tarot Token Manager

API para gerenciamento de fichas no aplicativo de consulta de tarot, incluindo resgates diários, dedução de fichas e consulta de status.

## ✨ Funcionalidades

- 🔁 **Resgate de Fichas**: Usuários podem resgatar uma ficha a cada 24 horas.
- ➖ **Uso de Fichas**: Deduz uma ficha do saldo do usuário autenticado.
- 📊 **Status de Fichas**: Retorna o saldo atual e o tempo restante até o próximo resgate.

## 🛠 Tecnologias Utilizadas

- **Node.js** – Ambiente de execução JavaScript.
- **Express** – Framework leve para criação de APIs.
- **Firebase Admin SDK** – Integração com Firestore e autenticação.
- **dotenv** – Gerenciamento de variáveis de ambiente.
- **Render** – Plataforma de hospedagem para o backend.

## 📋 Pré-requisitos

- Node.js v16 ou superior
- Conta no Firebase com Firestore habilitado
- Chave de serviço (Service Account) para o Firebase
- Variáveis de ambiente configuradas

## ⚙️ Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/itsmanek/open-tarot-token-manager.git
   cd open-tarot-token-manager
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o arquivo `.env` com suas credenciais Firebase:
   ```env
   FIREBASE_PROJECT_ID=seu-projeto-id
   FIREBASE_CLIENT_EMAIL=seu-email@projeto.iam.gserviceaccount.com
   _PRIVATEFIREBASE_KEY="-----BEGIN PRIVATE KEY-----\nSUA-PRIVATE-KEY\n-----END PRIVATE KEY-----"
   ```

## 🚀 Uso

1. Inicie o servidor:
   ```bash
   npm start
   ```

2. Acesse a API em:  
   [https://open-tarot-token-manager-ss53.onrender.com](https://open-tarot-token-manager-ss53.onrender.com)

## 📌 Endpoints

### `POST /tokens/claim`  
Resgata uma ficha para o usuário autenticado.

- **Headers**:  
  `Authorization: Bearer <token>`

- **Respostas**:
  - `200 OK`:
    ```json
    { "success": true, "amount": 3, "nextClaim": "2025-04-25T00:00:00Z" }
    ```
  - `403 Forbidden`:
    ```json
    { "error": "Too soon", "nextClaim": "2025-04-25T00:00:00Z", "amount": 2 }
    ```

---

### `POST /tokens/use`  
Deduz uma ficha do saldo do usuário.

- **Headers**:  
  `Authorization: Bearer <token>`

- **Respostas**:
  - `200 OK`:
    ```json
    { "success": true, "amount": 1 }
    ```
  - `400 Bad Request`:
    ```json
    { "error": "Insufficient tokens" }
    ```

---

### `GET /tokens/status`  
Retorna o saldo atual e o tempo restante para novo resgate.

- **Headers**:  
  `Authorization: Bearer <token>`

- **Resposta**:
  ```json
  {
    "amount": 2,
    "canClaim": false,
    "nextClaimIn": 7200000
  }
  ```

## ☁️ Deploy no Render

1. Crie um novo serviço Web no [Render](https://render.com/).
2. Conecte este repositório.
3. Configure as variáveis de ambiente com as mesmas do arquivo `.env`.
4. Defina o comando de inicialização:
   ```bash
   npm start
   ```