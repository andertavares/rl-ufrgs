(function(global){
  'use strict';

  function toNumber(value, fallback){
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  }

  function clampProbability(value){
    const p = toNumber(value, 0);
    if(p <= 0) return 0;
    if(p >= 1) return 1;
    return p;
  }

  function normalizeTransitions(transitions){
    const valid = (Array.isArray(transitions) ? transitions : []).filter((tr) => tr && tr.to !== null && tr.to !== undefined);
    if(valid.length === 0) return [];

    const safe = valid.map((tr) => ({
      to: tr.to,
      prob: clampProbability(tr.prob)
    }));

    const sum = safe.reduce((acc, tr) => acc + tr.prob, 0);
    if(sum <= 0){
      const uniform = 1 / safe.length;
      return safe.map((tr) => ({ to: tr.to, prob: uniform }));
    }

    return safe.map((tr) => ({ to: tr.to, prob: tr.prob / sum }));
  }

  function buildModel(states, actions){
    const modelStates = (Array.isArray(states) ? states : []).map((state) => ({
      id: state.id,
      name: state.name,
      reward: toNumber(state.reward, 0),
      terminal: Boolean(state.terminal)
    }));

    const stateById = new Map(modelStates.map((state) => [state.id, state]));
    const modelActions = [];

    (Array.isArray(actions) ? actions : []).forEach((action) => {
      if(!action || !stateById.has(action.stateId)) return;
      const transitions = normalizeTransitions(action.transitions).filter((tr) => stateById.has(tr.to));
      modelActions.push({
        id: action.id,
        stateId: action.stateId,
        name: action.name,
        transitions
      });
    });

    const actionById = new Map(modelActions.map((action) => [action.id, action]));
    const actionsByState = new Map();
    modelStates.forEach((state) => actionsByState.set(state.id, []));
    modelActions.forEach((action) => {
      actionsByState.get(action.stateId).push(action);
    });

    return { states: modelStates, actions: modelActions, stateById, actionById, actionsByState };
  }

  function initializeValues(model, seedValues){
    const values = {};
    const seed = seedValues && typeof seedValues === 'object' ? seedValues : {};

    model.states.forEach((state) => {
      const seeded = toNumber(seed[state.id], NaN);
      if(Number.isFinite(seeded)){
        values[state.id] = seeded;
        return;
      }
      values[state.id] = state.terminal ? state.reward : 0;
    });

    return values;
  }

  function reconcilePolicy(model, policy){
    const next = {};
    const current = policy && typeof policy === 'object' ? policy : {};

    model.states.forEach((state) => {
      if(state.terminal){
        next[state.id] = null;
        return;
      }

      const stateActions = model.actionsByState.get(state.id) || [];
      if(stateActions.length === 0){
        next[state.id] = null;
        return;
      }

      const selected = current[state.id];
      const found = stateActions.find((action) => action.id === selected);
      next[state.id] = found ? found.id : stateActions[0].id;
    });

    return next;
  }

  function qValue(state, action, values, gamma){
    if(!action || !Array.isArray(action.transitions) || action.transitions.length === 0){
      return state.reward;
    }

    let expected = 0;
    action.transitions.forEach((tr) => {
      expected += tr.prob * toNumber(values[tr.to], 0);
    });
    return state.reward + gamma * expected;
  }

  function policyEvaluationStep(model, values, policy, gamma){
    const discount = toNumber(gamma, 0.9);
    const currentValues = initializeValues(model, values);
    const reconciledPolicy = reconcilePolicy(model, policy);
    const updated = {};

    model.states.forEach((state) => {
      if(state.terminal){
        updated[state.id] = state.reward;
        return;
      }

      const actionId = reconciledPolicy[state.id];
      const action = actionId === null || actionId === undefined ? null : model.actionById.get(actionId);
      updated[state.id] = qValue(state, action, currentValues, discount);
    });

    return { values: updated, policy: reconciledPolicy };
  }

  function policyEvaluation(model, values, policy, gamma, iterations){
    const totalIterations = Math.max(1, Math.floor(toNumber(iterations, 1)));
    let currentValues = initializeValues(model, values);
    const reconciledPolicy = reconcilePolicy(model, policy);

    for(let i = 0; i < totalIterations; i++){
      currentValues = policyEvaluationStep(model, currentValues, reconciledPolicy, gamma).values;
    }

    return { values: currentValues, policy: reconciledPolicy };
  }

  function policyImprovementStep(model, values, policy, gamma){
    const discount = toNumber(gamma, 0.9);
    const currentValues = initializeValues(model, values);
    const currentPolicy = reconcilePolicy(model, policy);
    const nextPolicy = {};
    let changed = false;

    model.states.forEach((state) => {
      if(state.terminal){
        nextPolicy[state.id] = null;
        return;
      }

      const stateActions = model.actionsByState.get(state.id) || [];
      if(stateActions.length === 0){
        nextPolicy[state.id] = null;
        return;
      }

      let bestAction = stateActions[0];
      let bestValue = qValue(state, bestAction, currentValues, discount);
      for(let idx = 1; idx < stateActions.length; idx++){
        const candidate = stateActions[idx];
        const candidateValue = qValue(state, candidate, currentValues, discount);
        if(candidateValue > bestValue + 1e-12){
          bestValue = candidateValue;
          bestAction = candidate;
        }
      }

      nextPolicy[state.id] = bestAction.id;
      if(currentPolicy[state.id] !== bestAction.id){
        changed = true;
      }
    });

    return { policy: nextPolicy, stable: !changed };
  }

  function valueIterationStep(model, values, policy, gamma, evaluationIterations){
    const evaluated = policyEvaluation(model, values, policy, gamma, evaluationIterations);
    const improved = policyImprovementStep(model, evaluated.values, evaluated.policy, gamma);
    return {
      values: evaluated.values,
      policy: improved.policy,
      stable: improved.stable
    };
  }

  global.MDPValueIteration = {
    buildModel,
    initializeValues,
    reconcilePolicy,
    policyEvaluationStep,
    policyEvaluation,
    policyImprovementStep,
    valueIterationStep
  };
})(typeof window !== 'undefined' ? window : globalThis);
