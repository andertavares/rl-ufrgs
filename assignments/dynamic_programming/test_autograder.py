import unittest
import numpy as np
from gridworld import GridWorld4x3
from agent import ValueIterationAgent

class TestValueIteration(unittest.TestCase):
    def setUp(self):
        self.env = GridWorld4x3()
        self.agent = ValueIterationAgent(self.env, gamma=0.9)

    def test_gridworld_states(self):
        self.assertEqual(set(self.env.get_states()), set(range(12)) - {5})

    def test_gridworld_transitions(self):
        transitions = set(self.env.get_transitions(10, 0))
        expected = {
            (0.1, -0.04, 9), 
            (0.8, -0.04, 10), 
            (0.1, 1.0, 11)
        }
        self.assertEqual(transitions, expected)

    def test_agent_training(self):
        self.agent.compute_values(iterations=50)
        # Verifica se o V do estado inicial reflete propagação (esperado aprox 0.37)
        self.assertTrue(self.agent.V(0) > 0.3)
        # Verifica se a política gerada no estado inicial é a correta (Ir para Cima - 0)
        self.assertEqual(self.agent.greedy_action(0), 0)

if __name__ == "__main__":
    unittest.main()
