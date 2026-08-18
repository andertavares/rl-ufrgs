// value_iter.js
// Algoritmos de Avaliação de Política, Melhoria de Política e Iteração de Valor para MDPs

/**
 * Inicializa os valores dos estados a zero (ou reward para estados terminais).
 * @param {Array} states - array de estados [{id, reward, terminal}]
 * @returns {Object} mapa stateId -> valor inicial
 */
function initValues(states) {
  const v = {};
  states.forEach(s => { v[s.id] = s.terminal ? s.reward : 0; });
  return v;
}

/**
 * Inicializa a política com a primeira ação disponível de cada estado.
 * @param {Array} states - array de estados
 * @param {Array} actions - array de ações [{id, stateId, transitions}]
 * @returns {Object} mapa stateId -> actionId
 */
function initPolicy(states, actions) {
  const policy = {};
  states.forEach(s => {
    if (s.terminal) return;
    const sa = actions.filter(a => a.stateId === s.id);
    if (sa.length > 0) policy[s.id] = sa[0].id;
  });
  return policy;
}

/**
 * Executa um passo síncrono de avaliação de política.
 * V(s) = R(s) + γ * Σ_{s'} P(s'|s, π(s)) * V(s')
 *
 * @param {Array} states - array de estados
 * @param {Array} actions - array de ações
 * @param {Object} values - valores atuais { stateId: number }
 * @param {Object} policy - política atual { stateId: actionId }
 * @param {number} gamma - fator de desconto (0 < γ ≤ 1)
 * @returns {Object} novos valores
 */
function policyEvalStep(states, actions, values, policy, gamma) {
  const newV = {};
  states.forEach(s => {
    if (s.terminal) {
      newV[s.id] = s.reward;
      return;
    }
    const action = actions.find(a => a.id === policy[s.id]);
    if (!action) {
      newV[s.id] = s.reward;
      return;
    }
    let v = 0;
    action.transitions.forEach(tr => {
      if (tr.to !== null) v += tr.prob * (values[tr.to] !== undefined ? values[tr.to] : 0);
    });
    newV[s.id] = s.reward + gamma * v;
  });
  return newV;
}

/**
 * Executa a melhoria de política: para cada estado escolhe a ação gananciosa.
 * π'(s) = argmax_{a} [ R(s) + γ * Σ_{s'} P(s'|s,a) * V(s') ]
 *
 * @param {Array} states - array de estados
 * @param {Array} actions - array de ações
 * @param {Object} values - valores atuais
 * @param {number} gamma - fator de desconto
 * @returns {Object} nova política { stateId: actionId }
 */
function policyImprovement(states, actions, values, gamma) {
  const policy = {};
  states.forEach(s => {
    if (s.terminal) return;
    const sa = actions.filter(a => a.stateId === s.id);
    if (sa.length === 0) return;
    let bestId = sa[0].id;
    let bestQ = -Infinity;
    sa.forEach(action => {
      let q = 0;
      action.transitions.forEach(tr => {
        if (tr.to !== null) q += tr.prob * (values[tr.to] !== undefined ? values[tr.to] : 0);
      });
      const total = s.reward + gamma * q;
      if (total > bestQ) { bestQ = total; bestId = action.id; }
    });
    policy[s.id] = bestId;
  });
  return policy;
}

/**
 * Executa um passo de iteração de valor (equação de otimalidade de Bellman).
 * V(s) = R(s) + γ * max_{a} Σ_{s'} P(s'|s,a) * V(s')
 *
 * @param {Array} states - array de estados
 * @param {Array} actions - array de ações
 * @param {Object} values - valores atuais
 * @param {number} gamma - fator de desconto
 * @returns {Object} novos valores
 */
function valueIterStep(states, actions, values, gamma) {
  const newV = {};
  states.forEach(s => {
    if (s.terminal) {
      newV[s.id] = s.reward;
      return;
    }
    const sa = actions.filter(a => a.stateId === s.id);
    if (sa.length === 0) {
      newV[s.id] = s.reward;
      return;
    }
    let maxQ = -Infinity;
    sa.forEach(action => {
      let q = 0;
      action.transitions.forEach(tr => {
        if (tr.to !== null) q += tr.prob * (values[tr.to] !== undefined ? values[tr.to] : 0);
      });
      if (q > maxQ) maxQ = q;
    });
    newV[s.id] = s.reward + gamma * maxQ;
  });
  return newV;
}

/**
 * Calcula a política ótima implícita a partir dos valores (para iteração de valor).
 * Equivale a policyImprovement — fornecida como alias conveniente.
 * @param {Array} states
 * @param {Array} actions
 * @param {Object} values
 * @param {number} gamma
 * @returns {Object} política { stateId: actionId }
 */
function extractPolicy(states, actions, values, gamma) {
  return policyImprovement(states, actions, values, gamma);
}
