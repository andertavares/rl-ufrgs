# Roteiro de Aula — MDP, Retorno, Política e Funções de Valor

## Objetivo

Esta aula deve introduzir os conceitos de Processo de Decisão de Markov (MDP), retorno, política, função de valor de estado, função de valor de ação e optimalidade.

A apresentação deve ser **interativa**, especialmente nos conceitos de **retorno** e **função de valor**, que devem ser construídos intuitivamente antes da apresentação das equações formais.

A sequência pedagógica recomendada é:

> **experiência → observação → generalização → formalização matemática**

---

# 1. Objetivos de aprendizagem

Ao final da aula, o aluno deve ser capaz de:

1. Identificar os componentes de um MDP:
   - estados;
   - ações;
   - recompensas;
   - dinâmica de transição.
2. Interpretar probabilidades de transição e recompensas.
3. Diferenciar:
   - recompensa imediata;
   - retorno;
   - retorno descontado.
4. Explicar intuitivamente o papel do fator de desconto `γ`.
5. Definir uma política como uma distribuição de probabilidade sobre ações.
6. Interpretar `vπ(s)` como o retorno esperado ao seguir a política `π` a partir do estado `s`.
7. Entender por que uma função de valor precisa considerar os possíveis futuros.
8. Derivar intuitivamente a equação de Bellman para `vπ`.
9. Diferenciar função de valor de estado `vπ(s)` e função de valor de ação `qπ(s,a)`.
10. Entender a relação entre função de valor ótima e política ótima.

---

# 2. Estrutura geral da aula

| Bloco | Conceito | Interação principal |
|---|---|---|
| 1 | MDP | Explorar estados, ações e transições |
| 2 | Dinâmica | Clicar em uma ação e visualizar probabilidades |
| 3 | Recompensa × retorno | Acumular recompensas numa trajetória |
| 4 | Retorno | Calcular `Gt` passo a passo |
| 5 | Desconto | Slider de `γ` |
| 6 | Recursividade | Transformar `Gt` em `Rt+1 + γGt+1` |
| 7 | Política | Manipular `π(a\|s)` |
| 8 | Função de valor | Executar muitos episódios |
| 9 | Expectativa | Visualizar média/convergência |
| 10 | Bellman | Montar a equação a partir da árvore |
| 11 | `qπ` | Comparar ações |
| 12 | Ótimo | Extrair `π*` a partir de `v*` |
| 13 | Síntese | Conectar todos os conceitos |

---

# 3. MDP — do problema de decisão ao modelo

## Objetivo pedagógico

Começar com uma situação simples:

> Um agente precisa tomar decisões sequenciais. O resultado de uma ação depende do estado em que o agente está e pode haver incerteza.

Pergunta inicial:

> **O que precisamos especificar para descrever completamente esse problema?**

Mostrar progressivamente:

```text
Estado
   ↓
Ação
   ↓
Ambiente
   ↓
Novo estado + recompensa
```

Depois formalizar:

```text
S = conjunto de estados
A = conjunto de ações
R = conjunto de recompensas
P = dinâmica
```

A dinâmica deve ser apresentada em termos de:

- função/probabilidade de transição de estados;
- recompensa esperada.

## Interatividade

Criar uma pequena simulação em que o aluno possa clicar:

```text
ESTADO ATUAL
    [ Hungry ]

AÇÕES
    [ Eat ]    [ Don't eat ]
```

Após clicar em uma ação, mostrar uma animação:

```text
                 ┌── Hungry
Eat ─────────────┤
                 ├── Full
                 └── Starve
```

Mostrar gradualmente as probabilidades e recompensas.

## Pergunta interativa

> Se estou em `Hungry` e escolho `Eat`, qual é a probabilidade de terminar em `Full`?

Depois revelar:

```text
P(Full | Hungry, Eat) = 0.9
```

---

# 4. MDP como modelo de interação — Grid 4×3

Usar o grid 4×3 como o ambiente principal da aula.

Características:

- ações: `← ↑ → ↓`;
- 80% de chance de seguir a direção pretendida;
- 10% para cada uma das direções perpendiculares;
- bater na parede mantém o agente no mesmo estado;
- estado `[4,3]`: recompensa `+1`;
- estado `[4,2]`: recompensa `−1`;
- demais estados: recompensa `−0.04`.

## Interatividade

Permitir ao aluno:

- clicar em um estado;
- clicar em uma ação;
- visualizar as possíveis transições;
- visualizar as probabilidades;
- visualizar as recompensas.

Exemplo:

```text
             ↑ 0.8
             │
        ┌────┴────┐
        │ [3,2]   │
        │ p = 0.8 │
        └─────────┘
             ↑

[3,1] ── ↑ ──→

      ↙ 0.1       ↘ 0.1
    [2,1]          [4,1]
```

Reproduzir interativamente:

```text
P([3,2] | [3,1], ↑) = 0.8

P([2,1] | [3,1], ↑) = 0.1

P([4,1] | [3,1], ↑) = 0.1
```

---

# 5. Transição para retorno

Antes de introduzir o retorno, fazer uma pergunta conceitual:

> **Se o agente recebe uma recompensa agora, isso é suficiente para dizer que uma ação foi boa?**

Mostrar duas trajetórias:

```text
Trajetória A

s₀ → s₁ → s₂ → s₃
     +10
```

e

```text
Trajetória B

s₀ → s₁ → s₂ → s₃
     +1      +1    +1
```

Perguntar:

> Qual situação é melhor?

O objetivo é mostrar que uma medida baseada somente na recompensa imediata é insuficiente para avaliar decisões sequenciais.

---

# 6. RETORNO — primeira grande interatividade

Esta deve ser uma das partes mais interativas da aula.

## 6.1 Intuição antes da equação

Mostrar uma trajetória:

```text
t        t+1     t+2     t+3     terminal
│         │        │       │          │
S₀ ─────→ S₁ ────→ S₂ ───→ S₃ ─────→ T
          +2       -1      +5
```

Perguntar:

> Se estou em `S₀`, quanto ganharei no total a partir daqui?

Permitir que o aluno clique nas recompensas.

Cada clique adiciona a recompensa a um acumulador:

```text
G₀ = 2 + (-1) + 5
```

Depois:

```text
G₀ = 6
```

### Animação

As recompensas devem "viajar" pela trajetória e entrar em um acumulador:

```text
RETORNO

+2
-1
+5
----
 6
```

Mostrar explicitamente a diferença:

```text
RECOMPENSA
   ↓
um evento imediato

RETORNO
   ↓
acúmulo das recompensas futuras
```

---

# 7. Retorno — o problema do atraso

Usar o exemplo em que duas ações têm o mesmo retorno não descontado, embora uma recompensa aconteça muito mais tarde.

Mostrar:

```text
                 +1000
Ação A ────────────●
s₁ → s₂ → s₃ → ... → s₁₀₀₀
```

e uma alternativa com recompensa imediata.

Perguntar:

> Sem desconto, qual ação parece melhor?

Mostrar que os retornos não descontados podem ser iguais.

Em seguida perguntar:

> Mas intuitivamente as duas opções parecem realmente equivalentes?

Isso motiva o desconto de recompensas futuras.

---

# 8. Retorno descontado — interação com `γ`

Introduzir somente agora o fator de desconto.

Mostrar:

\[
G_t =
R_{t+1}
+\gamma R_{t+2}
+\gamma^2 R_{t+3}
+\cdots
\]

ou:

\[
G_t=\sum_{k=0}^{\infty}\gamma^kR_{t+k+1}
\]

com:

\[
\gamma\in[0,1].
\]

## Interação central

Criar um slider de `γ`:

```text
γ = 0.90
```

Mostrar uma linha temporal:

```text
             recompensa
               +10
                │
t ───── t+1 ─── t+2 ─── t+3 ─── t+4
        +1       +1       +1      +10
```

Ao mudar `γ`, atualizar em tempo real:

```text
γ = 1.00

G = 1 + 1 + 1 + 10
```

e, por exemplo:

```text
γ = 0.90

G = 1 + 0.9(1) + 0.9²(1) + 0.9³(10)
```

## Mostrar os pesos temporais

```text
recompensa     peso

Rₜ₊₁           1
Rₜ₊₂           γ
Rₜ₊₃           γ²
Rₜ₊₄           γ³
...
```

Slider:

```text
γ
0 ─────────────── 1
```

Quando `γ = 0`, mostrar:

> Só importa a próxima recompensa.

Quando `γ → 1`, mostrar:

> As recompensas futuras perdem cada vez menos peso.

O objetivo é que o aluno veja o significado operacional de `γ`, e não apenas memorize que ele é um fator de desconto.

---

# 9. Retorno — formulação recursiva

Depois que o aluno entende o retorno como soma descontada, fazer a derivação animada.

Começar:

\[
G_t =
R_{t+1}
+\gamma R_{t+2}
+\gamma^2R_{t+3}
+\gamma^3R_{t+4}+\cdots
\]

Destacar tudo depois de `Rt+1`:

\[
G_t =
R_{t+1}
+
\gamma
(
R_{t+2}
+\gamma R_{t+3}
+\gamma^2R_{t+4}
+\cdots
)
\]

Perguntar:

> O que está dentro dos parênteses?

Mostrar:

\[
G_{t+1}
=
R_{t+2}
+\gamma R_{t+3}
+\gamma^2R_{t+4}+\cdots
\]

Portanto:

\[
\boxed{G_t=R_{t+1}+\gamma G_{t+1}}
\]

## Interatividade

Construir a equação por blocos:

```text
Gt
 ↓
Rt+1 + γRt+2 + γ²Rt+3 + ...
 ↓
Rt+1 + γ(Rt+2 + γRt+3 + ...)
 ↓
Rt+1 + γGt+1
```

Não apresentar todas as equações simultaneamente no início.

---

# 10. Política — "o que o agente faz?"

Introduzir política.

Definir:

\[
\pi(a|s)
\]

como a probabilidade de selecionar a ação `a` no estado `s`.

Mostrar que:

\[
\pi(\cdot|s)
\]

é uma distribuição de probabilidade sobre as ações.

## Interação

Mostrar um estado:

```text
        ↑
        │ 0.7
← 0.1 ─ S ─ 0.1 →
        │
        ↓ 0.1
```

Ou uma interface:

```text
Estado [3,2]

←   [10%]
↑   [70%]
→   [10%]
↓   [10%]
```

Permitir alterar as probabilidades por sliders, mantendo:

\[
\sum_a \pi(a|s)=1.
\]

## Pergunta

> Uma política precisa necessariamente escolher sempre a mesma ação?

Mostrar:

```text
Política determinística:
π(↑|s) = 1
```

versus:

```text
Política estocástica:
π(↑|s) = 0.7
π(→|s) = 0.1
π(↓|s) = 0.1
π(←|s) = 0.1
```

---

# 11. A grande pergunta: "quanto vale estar neste estado?"

Mostrar novamente o grid, mas sem valores nos estados.

Perguntar:

> Se o agente estiver aqui e seguir esta política, quão bom é esse estado?

Não mostrar imediatamente `vπ(s)`.

Perguntar:

> Precisamos olhar apenas para a recompensa atual?

Não.

> Precisamos saber o que acontece depois?

Sim.

> Precisamos considerar os possíveis futuros?

Sim.

Então introduzir:

> **Valor de um estado = retorno esperado ao começar nesse estado e seguir a política.**

Somente depois revelar:

\[
\boxed{
v_\pi(s)=\mathbb{E}_\pi[G_t\mid S_t=s]
}
\]

---

# 12. FUNÇÃO DE VALOR — interatividade principal

Esta deve ser uma das interações centrais da aula.

## 12.1 Uma trajetória não é suficiente

Selecionar um estado `s` e uma política fixa.

Executar uma trajetória:

```text
s
↓
s₁
↓
s₂
↓
terminal

G = 3.2
```

Perguntar:

> Então `vπ(s) = 3.2`?

Resposta:

> **Não necessariamente.**

Executar novamente:

```text
G₁ = 3.2
G₂ = -0.8
G₃ = 1.7
G₄ = 4.1
...
```

Mostrar:

```text
Trajetória 1    3.2
Trajetória 2   -0.8
Trajetória 3    1.7
Trajetória 4    4.1
...
```

Depois:

\[
v_\pi(s)\approx\frac{G_1+G_2+\cdots+G_N}{N}
\]

## Controles

```text
[ Executar episódio ]

[ Executar 10 episódios ]
[ Executar 100 episódios ]
[ Executar 1000 episódios ]
```

Mostrar gráfico da estimativa:

```text
estimativa de vπ(s)

 ^
 |       ───────────────
 |     /
 |   /
 |  /
 +──────────────────────→ episódios
```

A média deve convergir à medida que aumentam as amostras.

## Intuição a produzir

> **Uma trajetória produz um retorno. A função de valor é uma propriedade esperada de muitas possíveis trajetórias sob uma política.**

---

# 13. De onde vem o valor? — decomposição passo a passo

Voltar à definição:

\[
v_\pi(s)=E_\pi[G_t|S_t=s]
\]

Substituir o retorno recursivo:

\[
G_t=R_{t+1}+\gamma G_{t+1}
\]

obtendo:

\[
v_\pi(s)
=
E_\pi[R_{t+1}+\gamma G_{t+1}\mid S_t=s]
\]

Perguntar:

> Para calcular esse valor, o que precisamos saber sobre o primeiro passo?

Mostrar:

```text
Estado s
   │
   │ política π
   ↓
ação a
   │
   │ dinâmica do ambiente
   ↓
recompensa r + próximo estado s'
```

Separar visualmente:

```text
Decisão do agente
        +
Dinâmica do ambiente
        +
Recompensa
        +
Valor do futuro
```

---

# 14. Derivação visual da equação de Bellman

Não apresentar a equação completa de imediato.

Construir progressivamente:

```text
valor de s
   ↓
valor esperado dos possíveis primeiros passos
   ↓
ação escolhida segundo π
   ↓
resultado da dinâmica p(s',r|s,a)
   ↓
r + γvπ(s')
```

Depois montar:

\[
v_\pi(s)
=
\sum_a
\pi(a|s)
\sum_{s',r}
p(s',r|s,a)
\left[
r+\gamma v_\pi(s')
\right]
\]

## Interatividade

Cada termo deve ser clicável ou destacado:

```text
π(a|s)
↑
probabilidade de escolher a ação
```

```text
p(s',r|s,a)
↑
probabilidade de obter aquele resultado
```

```text
r
↑
recompensa imediata
```

```text
γvπ(s')
↑
valor descontado do futuro
```

O aluno deve perceber que a equação é a combinação de:

**política + dinâmica + recompensa + desconto + valor futuro.**

---

# 15. Interação "calcule o valor deste estado"

Usar um MDP pequeno, com poucos estados.

Exemplo:

```text
              0.8, +1
          ┌─────────────→ s₂
          │
s₁ ───────┤
          │
          └─────────────→ s₃
              0.2, -1
```

Dados:

```text
γ = 0.9

vπ(s₂) = 5
vπ(s₃) = -2
```

Perguntar:

> Qual é o valor de `s₁`?

Fazer o aluno montar:

\[
v_\pi(s_1)
=
0.8[1+0.9(5)]
+
0.2[-1+0.9(-2)]
\]

Somente depois revelar o resultado.

## Interatividade

Cada termo deve ser clicável:

```text
0.8
↑
probabilidade
```

```text
1
↑
recompensa
```

```text
0.9
↑
desconto
```

```text
5
↑
valor do próximo estado
```

---

# 16. Backup diagram — transformar a equação em algoritmo mental

Mostrar o diagrama:

```text
                 s
                 │
          ┌──────┼──────┐
          │      │      │
         π(a₁)  π(a₂)  π(a₃)
          │      │      │
       ambiente ambiente ambiente
        /   \      / \      / \
       ...  ...   ... ...  ... ...
```

Mensagem central:

> **Para estimar o valor de um estado, olhamos um passo à frente e usamos os valores dos estados seguintes.**

Esse ponto deve preparar o terreno para métodos posteriores de programação dinâmica e aprendizado por diferença temporal.

---

# 17. Função de valor de ação `qπ(s,a)`

Introduzir a pergunta:

> E se não quisermos perguntar apenas "quão bom é estar em `s`?", mas "quão boa é esta ação em `s`?"

Definir:

\[
q_\pi(s,a)
\]

como:

> **retorno esperado ao executar a ação `a` em `s` e seguir `π` daí em diante.**

## Interação

Mostrar:

```text
                 Estado s

            ┌────┼────┐
            ↓    ↓    ↓
           a₁   a₂   a₃
            │    │    │
          qπ   qπ   qπ
```

Exemplo:

```text
qπ(s,↑) = 4.2
qπ(s,→) = 1.7
qπ(s,↓) = -0.5
qπ(s,←) = 3.1
```

Perguntar:

> Qual ação você escolheria?

Resposta: `↑`.

---

# 18. Relação entre `vπ` e `qπ`

Mostrar que o valor do estado é uma média ponderada dos valores das ações:

\[
v_\pi(s)
=
\sum_a \pi(a|s)q_\pi(s,a)
\]

Exemplo:

```text
Estado s

↑ q = 4.2
→ q = 1.7
↓ q = -0.5
← q = 3.1
```

Com:

```text
π(↑|s) = 0.5
π(→|s) = 0.2
π(↓|s) = 0.1
π(←|s) = 0.2
```

Mostrar visualmente a média ponderada.

Mensagem importante:

> `v(s)` não significa "o valor da melhor ação".

> `v(s)` é o valor esperado **seguindo a política**.

---

# 19. Políticas e valores ótimos

Somente depois de consolidar `vπ` e `qπ`, introduzir optimalidade.

Definir:

- `π*`: política ótima;
- `v*`: função de valor ótima;
- `q*`: função de valor de ação ótima.

Mostrar duas políticas:

```text
π₁                 π₂

↑ 100%             → 100%

vπ₁(s) = 4.2       vπ₂(s) = 6.7
```

Perguntar:

> Qual política é melhor?

Depois mostrar vários estados e comparar seus valores.

---

# 20. Descobrir a política ótima a partir dos valores

No grid 4×3, mostrar os valores dos estados e as ações possíveis.

Exemplo conceitual:

```text
┌──────┬──────┬──────┬──────┐
│      │      │      │  +1  │
│      │      │      │  ↑   │
├──────┼──────┼──────┼──────┤
│      │      │      │  -1  │
│      │      │      │  ↓   │
├──────┼──────┼──────┼──────┤
│  →   │  →   │  ↑   │  ←   │
└──────┴──────┴──────┴──────┘
```

Permitir clicar em um estado:

```text
v*(s)

Valores das ações:

←  2.1
↑  4.8   ← melhor
→  3.2
↓  1.4
```

Então destacar:

```text
π*(s) = ↑
```

A conclusão deve ser:

> **A política ótima pode ser obtida escolhendo ações que maximizam o valor ótimo.**

---

# 21. Síntese visual final

Terminar a aula com uma única cadeia conceitual:

```text
                    MDP
                     │
       ┌─────────────┼─────────────┐
       ↓             ↓             ↓
    Estado         Ação        Dinâmica
                                  │
                                  ↓
                              recompensa
                                  │
                                  ↓
                              trajetórias
                                  │
                                  ↓
                               RETORNO
                                  │
                                  ↓
                       retorno esperado
                                  │
                                  ↓
                           FUNÇÃO DE VALOR
                                  │
                    ┌─────────────┴─────────────┐
                    ↓                           ↓
                vπ(s)                       qπ(s,a)
                    │                           │
                    └─────────────┬─────────────┘
                                  ↓
                            valores ótimos
                                  │
                                  ↓
                             política ótima
```

E, paralelamente:

```text
RETORNO
   │
   ├── soma das recompensas futuras
   │
   └── desconto γ
            ↓
       Gt = Rt+1 + γGt+1
            ↓
FUNÇÃO DE VALOR
   │
   └── Eπ[Gt | St=s]
            ↓
EQUAÇÃO DE BELLMAN
```

---

# 22. Requisitos específicos para os slides HTML + JS

## Interatividade pedagógica

A apresentação deve ser uma aula interativa, e não uma sequência de slides estáticos.

Os conceitos de **retorno** e **função de valor** devem ser construídos progressivamente por meio de:

- simulações;
- animações;
- perguntas;
- manipulação de parâmetros;
- cálculos passo a passo;

antes da apresentação das equações formais.

## Para retorno

Implementar:

1. **Timeline interativa de recompensas**
   - estados como nós;
   - recompensas como eventos entre estados;
   - botão "avançar passo";
   - acumulador mostrando `Gt`.

2. **Comparação entre trajetórias**
   - pelo menos duas trajetórias;
   - cálculo automático dos retornos;
   - destaque da diferença entre recompensa imediata e retorno.

3. **Slider de `γ`**
   - intervalo `[0,1]`;
   - atualização instantânea dos pesos `1, γ, γ², ...`;
   - atualização do retorno;
   - visualização gráfica do peso de cada recompensa futura.

4. **Derivação animada**
   - construir `Gt` termo a termo;
   - fatorar `γ`;
   - identificar visualmente `Gt+1`;
   - chegar a `Gt = Rt+1 + γGt+1`.

## Para função de valor

Implementar:

1. **Simulação Monte Carlo visual**
   - selecionar um estado;
   - executar episódios segundo uma política;
   - mostrar cada retorno obtido;
   - calcular a média acumulada;
   - mostrar convergência da média para `vπ(s)`.

2. **Separação entre trajetória e expectativa**
   - deixar explícito que uma trajetória produz um `G`;
   - várias trajetórias produzem uma distribuição de `G`;
   - `vπ(s)` é a esperança dessa distribuição.

3. **Derivação visual de Bellman**
   - primeiro estado;
   - depois ação segundo `π`;
   - depois transição segundo `p`;
   - depois recompensa;
   - depois `γvπ(s')`;
   - finalmente somas e probabilidades.

4. **Calculadora de Bellman**
   - usuário seleciona um estado;
   - mostra possíveis ações;
   - mostra `π(a|s)`;
   - mostra possíveis `(s',r)`;
   - calcula cada contribuição;
   - soma as contribuições;
   - monta progressivamente a equação.

## Para política

Implementar:

- distribuição interativa de `π(a|s)`;
- barras ou círculos proporcionais às probabilidades;
- alteração das probabilidades por sliders;
- execução de episódios usando a política selecionada.

## Para `qπ`

Implementar:

- mostrar `qπ(s,a)` individualmente para cada ação;
- permitir selecionar uma ação;
- comparar `qπ(s,a)` entre ações;
- mostrar a relação entre `qπ` e `vπ`.

## Para optimalidade

Implementar:

- visualização de `v*(s)`;
- valores das ações;
- destaque automático da ação com maior valor;
- seta correspondente à política gulosa;
- possibilidade de percorrer o grid estado por estado.

---

# 23. Decisão pedagógica central

A parte de função de valor **não deve começar com a equação**:

\[
v_\pi(s)=E_\pi[G_t\mid S_t=s].
\]

Começar com:

> **Se eu colocar o agente neste estado e repetir a experiência várias vezes, o que acontece com o retorno?**

Construir:

```text
1 episódio
    ↓
um retorno G

vários episódios
    ↓
G₁, G₂, G₃, ...

muitos episódios
    ↓
distribuição de retornos

média dos retornos
    ↓
retorno esperado

retorno esperado a partir de s
    ↓
vπ(s)

formalização
    ↓
vπ(s) = Eπ[Gt | St=s]
```

A ideia fundamental que o aluno deve levar é:

> **Uma trajetória produz um retorno. A função de valor é o retorno esperado de muitas trajetórias possíveis, condicionado ao estado inicial e à política seguida.**

Da mesma forma, a equação de Bellman deve surgir como resposta à pergunta:

> **"Como podemos calcular essa expectativa olhando apenas para o primeiro passo e para os valores dos estados seguintes?"**

A sequência desejada é:

```text
retorno
   ↓
retorno descontado
   ↓
retorno recursivo
   ↓
política
   ↓
retorno esperado
   ↓
função de valor
   ↓
decomposição do primeiro passo
   ↓
equação de Bellman
   ↓
qπ
   ↓
valores ótimos
   ↓
política ótima
```

Essa sequência deve orientar tanto a organização visual quanto as animações e interações da apresentação.
