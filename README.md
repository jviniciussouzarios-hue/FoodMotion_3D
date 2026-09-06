# FoodMotion 3D - Plataforma Interativa de Customização Gastronômica 🍕✨

Plataforma gastronômica modular de delivery baseada na filosofia **Visual First**: o cliente personaliza sua pizza em 3D em tempo real, visualiza animações de queda e subida para cada ingrediente, inspeciona o combo com bebida na mesa 3D e acompanha o status do pedido através de um fluxograma interativo.

---

## 🚀 Funcionalidades Principais

1. **Vitrine & Cardápio Gastronômico**:
   - Cabeçalho de restaurante com horários, endereço, taxa de entrega e abas de categorias.
   - Catálogo de pizzas, bebidas geladas e acompanhamentos.

2. **Montador 3D em Tempo Real (Three.js)**:
   - Massa procedural, bordas personalizáveis (Tradicional, Catupiry, Cheddar, Chocolate Vulcão).
   - Molho rústico de tomate e muçarela derretida com toques gratinados.
   - Recheios modulares (Calabresa, Cebola, Presunto, Azeitonas, Manjericão, Tomate, Champignon, Bacon, Frango, Catupiry, Milho, Carne Seca, Orégano).
   - **Animações Fluidas**: Ingredientes caem do alto ao serem adicionados e sobem girando ao serem retirados.
   - **Divisão Meio a Meio**: Coordenadas espaciais isoladas garantem que cada sabor fique restrito à sua metade (esquerda ou direita).

3. **Carrinho 3D com Mesa Gastronômica**:
   - Exibe a **pizza personalizada ao lado da lata de refrigerante 3D** sobre uma mesa rústica.
   - Controles de rotação e inspeção do combo antes de fechar o pedido.

4. **Fluxograma de Rastreamento de Pedido**:
   - Stepper vertical animado (Realizado ➔ Confirmado ➔ Em Preparo ➔ Em Rota ➔ Finalizado).
   - Previsão de horário dinâmico e botão interativo de simulação de etapas.

5. **Backend PHP 8.2 & Banco MySQL Local**:
   - Auto-migração que cria o banco `foodmotion_3d` e tabelas com sufixo `_FoodMotion_3D` automaticamente.
   - Endpoints REST para catálogo, ingredientes e pedidos.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, Vanilla CSS3 (Design System Dark Mode Gastronômico), JavaScript ES6 Modular.
- **3D & Animações**: Three.js (r128), OrbitControls, GSAP (GreenSock).
- **Backend**: PHP 8.2 com PDO e Prepared Statements.
- **Banco de Dados**: MySQL 10.4 (MariaDB / XAMPP).
