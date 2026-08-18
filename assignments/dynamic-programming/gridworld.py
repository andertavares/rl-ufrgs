import gymnasium as gym
from gymnasium import spaces
import numpy as np
from typing import Optional, Iterable, Tuple

class GridWorld4x3(gym.Env):
    metadata = {"render_modes": ["ansi"]}

    def __init__(
        self,
        reward_step: float = -0.04,
        slip: float = 0.2,
        seed: Optional[int] = None,
        render_mode: Optional[str] = None,
    ):
        super().__init__()
        self.nrows = 3
        self.ncols = 4
        self.reward_step = reward_step
        self.slip = slip
        self.start_pos = (0, 0)
        self.goal_pos = (3, 2)
        self.pit_pos = (3, 1)
        self.wall_pos = (1, 1)

        self.observation_space = spaces.Discrete(12)
        self.action_space = spaces.Discrete(4)
        self.current_state = self.pos_to_state(self.start_pos)

    def pos_to_state(self, pos):
        x, y = pos
        return y * self.ncols + x

    def state_to_pos(self, s):
        return (s % self.ncols, s // self.ncols)

    def get_states(self) -> Iterable[int]:
        """Retorna todos os estados válidos (exceto parede)."""
        # TODO: Implementar retorno dos estados válidos
        pass

    def is_terminal(self, state: int) -> bool:
        """Verifica se o estado é terminal (goal ou pit)."""
        # TODO: Implementar verificação de estado terminal
        pass

    def get_actions(self, state: int) -> Iterable[int]:
        """Retorna ações válidas. Se terminal, nenhuma ação é possível."""
        # TODO: Implementar retorno das ações válidas
        pass

    def get_transitions(self, state: int, action: int) -> Iterable[Tuple[float, float, int]]:
        """Retorna lista de (p, r, s') para aplicar a ação em um estado."""
        # TODO: Implementar lógica de transição considerando escorregões (slip) e limites
        pass

    def reset(self, *, seed: Optional[int] = None, options: Optional[dict] = None):
        super().reset(seed=seed)
        self.current_state = self.pos_to_state(self.start_pos)
        return self.current_state, {}

    def step(self, action):
        # Para planejamento DP, step não é estritamente necessário se usar get_transitions
        pass

    def render(self, mode=None):
        pass
