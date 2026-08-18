from gridworld import GridWorld4x3
from agent import ValueIterationAgent
from visualizer import AgentVisualizer

def main():
    env = GridWorld4x3()
    agent = ValueIterationAgent(env, gamma=0.9)
    print("Iniciando Iteração de Valor...")
    agent.compute_values(iterations=50)

    viz = AgentVisualizer(agent, env)

    print("\n=== Política ===")
    viz.print_policy()

    print("\n=== V(s) ===")
    viz.print_values()

    print("\n=== Q(s,a) ===")
    viz.print_qvalues()

if __name__ == "__main__":
    main()
