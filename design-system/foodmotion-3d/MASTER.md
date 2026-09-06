# Design System: FoodMotion 3D

## 1. Identidade Visual & Tema
- **Tema Central**: Dark Mode Gastronômico Premium (OLED Dark + Tons Quentes de Forno à Lenha)
- **Atmosfera**: Sofisticada, moderna, apetitosa e imersiva.

## 2. Cores & Tokens (CSS Variables)
```css
:root {
  /* Cores Principais */
  --bg-main: #0a0c10;
  --bg-surface: #12161f;
  --bg-card: rgba(26, 31, 44, 0.75);
  --bg-card-hover: rgba(35, 42, 60, 0.85);
  
  /* Cores Gastronômicas & Acento */
  --primary-red: #e11d48;
  --primary-red-hover: #be123c;
  --primary-orange: #ea580c;
  --accent-gold: #f59e0b;
  --accent-gold-glow: rgba(245, 158, 11, 0.35);
  --accent-green: #10b981;
  --accent-green-glow: rgba(16, 185, 129, 0.3);
  
  /* Tipografia */
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --text-dim: #64748b;
  
  /* Bordas & Glassmorphism */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-focus: rgba(245, 158, 11, 0.6);
  --glass-blur: blur(14px);
  
  /* Sombras */
  --shadow-card: 0 10px 30px -5px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 25px rgba(225, 29, 72, 0.25);
  
  /* Fontes */
  --font-heading: 'Outfit', -apple-system, sans-serif;
  --font-body: 'Inter', -apple-system, sans-serif;
}
```

## 3. Diretrizes de Componentes
- **Botões**: Raios arredondados (12px ou pill 9999px), transições suaves de 200ms, feedback de toque no mobile.
- **Visualizador 3D**: Canvas com cantos arredondados, fundo radial degradê com iluminação central, controles visuais flutuantes em vidro fosco.
- **Rastreamento de Pedido**: Linha vertical luminosa (stepper) com ícones circulares com animação pulsante no status ativo.
- **Carrinho 3D**: Visão em ângulo 3/4 com piso de madeira nobre rústica para destacar a pizza e a lata de refrigerante.
