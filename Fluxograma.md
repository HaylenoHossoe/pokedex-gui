---
config:
  layout: dagre
---
flowchart LR
    A["Início:<br>Push para main<br>Trigger Manual"] --> B{"Job:<br>testes_e_build"}
    B --> B1["Verificar<br>o Código"]
    B1 --> B2["Instalar<br>Dependências"]
    B2 --> B3["Executar<br>Testes"]
    B3 --> B4["Fazer Build do<br>Aplicativo React"]
    B4 -- Sucesso --> C{"Job:<br>analise_sonarcloud"}
    B4 -- Falha --> F["Pipeline<br>Falha"]
 
    C --> C1["Fazer Checkout<br>do Código"]
    C1 --> C2["Configurar<br>Node.js"]
    C2 --> C3["Executar Análise<br>SonarCloud"]
    C3 -- Sucesso --> D{"Job:<br>deploy"}
    C3 -- Falha --> F

    D --> D1["Verificar<br>o Código"]
    D1 --> D2["Configurar<br>Credenciais AWS"]
    D2 --> D3["Implantar Stack<br>CloudFormation<br>ECS/Fargate"]
    D3 --> D4["Fazer Login no<br>Docker Hub"]
    D4 --> D5["Fazer Build da<br>Imagem Docker"]
    D5 --> D6["Escanear Imagem<br>Docker com Trivy"]
    D6 -- Sucesso --> D7["Enviar Imagem<br>para o<br>Docker Hub"]
    D6 -- Falha (vulnerabilidades) --> F
    D7 --> D8["Forçar Novo Deploy<br>do Serviço ECS"]
    D8 -- Sucesso --> E["Fim:<br>Aplicação Atualizada<br>em Produção"]
    D8 -- Falha --> F

     A:::startEndNode
     B:::jobNode
     C:::jobNode
     F:::failNode
     D:::jobNode
     E:::successNode

    classDef jobNode fill:#1F497D,stroke:#333,stroke-width:2px,font-fill:#FFF
    classDef startEndNode fill:#4676A8,stroke:#333,stroke-width:2px,font-fill:#FFF
    classDef successNode fill:#1E8449,stroke:#333,stroke-width:2px,font-fill:#FFF
    classDef failNode fill:#C0392B,stroke:#333,stroke-width:2px,font-fill:#FFF

    style A color:#FFFFFF
    style B color:#FFFFFF
    style C color:#FFFFFF
    style F color:#FFFFFF
    style D color:#FFFFFF
    style E color:#FFFFFF

