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
      prob: clampProbability(tr.prob),
      reward: Number.isFinite(Number(tr.reward)) ? Number(tr.reward) : (Number.isFinite(Number(tr.r)) ? Number(tr.r) : undefined)
    }));

    const sum = safe.reduce((acc, tr) => acc + tr.prob, 0);
    if(sum <= 0){
      const uniform = 1 / safe.length;
      return safe.map((tr) => ({ to: tr.to, prob: uniform, reward: tr.reward }));
    }

    return safe.map((tr) => ({ to: tr.to, prob: tr.prob / sum, reward: tr.reward }));
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
      values[state.id] = 0;
    });

    return values;
  }

  function resetValues(model, defaultValue = 0){
    const values = {};
    const fallback = toNumber(defaultValue, 0);

    (Array.isArray(model && model.states) ? model.states : []).forEach((state) => {
      values[state.id] = fallback;
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

  function transitionReward(tr, nextState){
    if(!tr || typeof tr !== 'object') return 0;

    if(Number.isFinite(Number(tr.reward))) return Number(tr.reward);
    if(Number.isFinite(Number(tr.r))) return Number(tr.r);
    if(nextState && Number.isFinite(Number(nextState.reward))) return Number(nextState.reward);

    return 0;
  }

  function qValue(model, state, action, values, gamma){
    if(!action || !Array.isArray(action.transitions) || action.transitions.length === 0){
      return 0;
    }

    let expected = 0;
    action.transitions.forEach((tr) => {
      if(tr && tr.to !== null && tr.to !== undefined){
        const nextState = model.stateById.get(tr.to);
        const reward = transitionReward(tr, nextState);
        expected += tr.prob * (reward + gamma * toNumber(values[tr.to], 0));
      }
    });
    return expected;
  }

  function bellmanOptimalityValue(model, values, state, gamma){
    const discount = toNumber(gamma, 0.9);
    const currentValues = initializeValues(model, values);

    if(state.terminal){
      return 0;
    }

    const stateActions = model.actionsByState.get(state.id) || [];
    if(stateActions.length === 0){
      return 0;
    }

    let bestValue = -Infinity;

    stateActions.forEach((action) => {
      if(!action || !Array.isArray(action.transitions) || action.transitions.length === 0){
        bestValue = Math.max(bestValue, 0);
        return;
      }

      const actionValue = qValue(model, state, action, currentValues, discount);
      if(actionValue > bestValue){
        bestValue = actionValue;
      }
    });

    return Number.isFinite(bestValue) ? bestValue : 0;
  }

  function valueIterationStep(model, values, gamma, iterations){
    const discount = toNumber(gamma, 0.9);
    const totalIterations = Math.max(1, Math.floor(toNumber(iterations, 1)));
    let currentValues = initializeValues(model, values);
    let stable = true;

    for(let i = 0; i < totalIterations; i++){
      const nextValues = {};
      model.states.forEach((state) => {
        const updatedValue = bellmanOptimalityValue(model, currentValues, state, discount);
        nextValues[state.id] = updatedValue;
      });

      if(model.states.some((state) => Math.abs(toNumber(nextValues[state.id], 0) - toNumber(currentValues[state.id], 0)) > 1e-12)){
        stable = false;
      }

      currentValues = nextValues;
    }

    return { values: currentValues, policy: {}, stable };
  }

  global.MDPValueIteration = {
    buildModel,
    initializeValues,
    resetValues,
    reconcilePolicy,
    bellmanOptimalityValue,
    valueIterationStep
  };
})(typeof window !== 'undefined' ? window : globalThis);
