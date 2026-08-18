import numpy as np
import gymnasium as gym

class ValueIterationAgent:
    def __init__(self, env: gym.Env, gamma: float) -> None:
        self.env = env
        self.gamma = gamma
        self.V_values = {s: 0.0 for s in self.env.get_states()}

    def V(self, state: int) -> float:
        """Retorna o valor estimado do estado."""
        return self.V_values[state]

    def compute_values(self, iterations: int = 100) -> None:
        """Executa iteração de valor por um número fixo de passos."""
        # TODO: Implementar loop principal de iteração de valor
        pass

    def Q(self, state: int, action: int) -> float:
        """Retorna o valor Q(s,a) com base nas transições do ambiente."""
        # TODO: Implementar cálculo de Q(s, a) usando self.env.get_transitions
        pass

    def greedy_action(self, state: int) -> int:
        """Retorna a ação gulosa em relação aos valores atuais."""
        # TODO: Implementar extração de política (escolha da melhor ação)
        pass
