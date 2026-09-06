# Feature Specification: FoodMotion 3D Platform

**Feature Directory**: `specs/001-foodmotion-3d`
**Status**: Approved / In Implementation
**Domain**: Interactive 3D Food Customization & Delivery Experience

## 1. Visão Geral & Problema de Negócio
Plataformas tradicionais de delivery utilizam fotos estáticas 2D e listas de caixas de seleção que não transmitem o apelo visual do produto montado. 
O **FoodMotion 3D** transforma o ato de pedir comida em uma experiência visual e interativa:
1. **Vitrine & Cardápio Completo**: Cabeçalho de restaurante estilizado, categorias (Pizzas, Bebidas, Sobremesas, Acompanhamentos), itens e filtros.
2. **Montagem 3D Modular (Visual-First)**: O cliente monta sua pizza camada por camada em 3D realista (massa, borda, molho, queijo, recheios). Cada ingrediente cai do céu ao ser adicionado e sobe ao ser removido.
3. **Divisão Meio a Meio**: Ingredientes de cada sabor ficam confinados estritamente à sua metade (esquerda ou direita).
4. **Carrinho 3D Interativo**: Ao abrir o carrinho ou revisar o pedido, uma cena 3D exibe os produtos juntos sobre uma mesa/tábua de madeira (ex: a pizza personalizada com os ingredientes reais escolhidos ao lado de uma lata de refrigerante 3D gelada e realista).
5. **Rastreamento de Pedido em Fluxograma**: Stepper visual em tempo real mostrando as etapas do pedido (Realizado -> Confirmado -> Em Preparo -> Rota de Entrega -> Concluído), previsão de horário e resumo do pedido.

## 2. Cenários de Usuário (User Scenarios)
- **Cenário 1 - Navegação & Escolha**: Usuário acessa o restaurante, visualiza horários, endereço, categorias e seleciona uma pizza para personalizar.
- **Cenário 2 - Personalização 3D**: Usuário escolhe tamanho, massa, borda e define dois sabores (Meia Portuguesa / Meia Calabresa). Ao selecionar os sabores, os ingredientes caem em cascata em cada metade correspondente. O usuário retira cebola de um lado: as rodelas de cebola daquela metade sobem e somem.
- **Cenário 3 - Carrinho 3D**: Usuário adiciona uma bebida (ex: Coca-Cola / Guaraná) e abre o carrinho. Uma cena 3D renderiza a pizza exatamente como montada lado a lado com a lata 3D da bebida. O usuário pode rotacionar a cena e conferir o combo visualmente.
- **Cenário 4 - Finalização & Acompanhamento**: Usuário confirma o pedido. O sistema gera o número do pedido, salva no banco de dados MySQL e exibe a tela de rastreamento (fluxograma de status) com tempo estimado de entrega.

## 3. Requisitos Funcionais
- **RF01**: Interface responsiva compatível com desktop (duas colunas) e celular (bottom sheet deslizante).
- **RF02**: Motor 3D em Three.js renderizando pizza procedural e modular (massa, borda, molho, queijo e múltiplos recheios com PBR e iluminação quente de estúdio).
- **RF03**: Animações de queda (adicionar) e subida/fade (remover) para cada ingrediente independente.
- **RF04**: Motor de divisões (Inteira, Meia Esquerda, Meia Direita) com filtragem de coordenadas X e materiais separados para cada região.
- **RF05**: Carrinho 3D multi-produto: visualização conjunta da pizza personalizada e bebidas/acompanhamentos 3D em uma tábua gastronômica.
- **RF06**: Fluxograma interativo de rastreamento do pedido com linha do tempo vertical e indicação visual de status.
- **RF07**: API REST em PHP com auto-migração de banco de dados MySQL (`foodmotion_3d`) nas credenciais locais.
- **RF08**: Persistência de pedidos com snapshot completo dos itens em JSON e cálculo dinâmico de valores.

## 4. Critérios de Sucesso
- Renderização 3D fluida a 60 FPS no desktop e 30+ FPS em celulares.
- Tempo de carregamento inicial otimizado com assets e geometrias procedurais leves.
- Banco de dados inicializado automaticamente sem requisições manuais do usuário.
