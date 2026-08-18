import numpy as np

class AgentVisualizer:
    def __init__(self, agent, env):
        self.agent = agent
        self.env = env
        self.action_to_str = {0: "↑", 1: "→", 2: "↓", 3: "←"}

        self.wall_s = self.env.pos_to_state(self.env.wall_pos)
        self.start_s = self.env.pos_to_state(self.env.start_pos)
        self.goal_s = self.env.pos_to_state(self.env.goal_pos)
        self.pit_s = self.env.pos_to_state(self.env.pit_pos)

    def print_policy(self):
        rows, cols = self.env.nrows, self.env.ncols
        horiz = "+" + "+".join(["------"] * cols) + "+"

        for y in reversed(range(rows)):
            print(horiz)
            cells = []
            for x in range(cols):
                s = self.env.pos_to_state((x, y))
                if s == self.wall_s:
                    content = "##"
                elif s == self.goal_s:
                    content = " G "
                elif s == self.pit_s:
                    content = " P "
                else:
                    a = self.agent.greedy_action(s)
                    arrow = self.action_to_str.get(a, "?")
                    if s == self.start_s:
                        content = f"S{arrow}"
                    else:
                        content = arrow
                cells.append(f"{content:^6}")
            print("|" + "|".join(cells) + "|")
        print(horiz)

    def print_values(self):
        rows, cols = self.env.nrows, self.env.ncols
        horiz = "+" + "+".join(["--------"] * cols) + "+"

        for y in reversed(range(rows)):
            print(horiz)
            cells = []
            for x in range(cols):
                s = self.env.pos_to_state((x, y))
                if s == self.wall_s:
                    content = "####"
                else:
                    v = self.agent.V(s)
                    if s == self.goal_s:
                        content = f"G({v:.2f})"
                    elif s == self.pit_s:
                        content = f"P({v:.2f})"
                    else:
                        content = f"{v:6.2f}"
                cells.append(f"{content:^8}")
            print("|" + "|".join(cells) + "|")
        print(horiz)

    def print_qvalues(self):
        rows, cols = self.env.nrows, self.env.ncols
        horiz = "+" + "+".join(["-------------"] * cols) + "+"

        for y in reversed(range(rows)):
            print(horiz)
            line1, line2, line3 = [], [], []
            for x in range(cols):
                s = self.env.pos_to_state((x, y))
                if s == self.wall_s:
                    c1 = "#############"
                    c2 = "#############"
                    c3 = "#############"
                elif self.env.is_terminal(s):
                    v = self.agent.V(s)
                    if s == self.goal_s:
                        txt = f"G({v:.2f})"
                    elif s == self.pit_s:
                        txt = f"P({v:.2f})"
                    else:
                        txt = f"T({v:.2f})"
                    c1 = f"{txt:^13}"
                    c2 = " " * 13
                    c3 = " " * 13
                else:
                    qvals = [self.agent.Q(s, a) for a in range(4)]
                    best = int(np.argmax(qvals))
                    up = f"↑:{qvals[0]:.2f}"
                    left = f"←:{qvals[3]:.2f}"
                    right = f"→:{qvals[1]:.2f}"
                    down = f"↓:{qvals[2]:.2f}"
                    c1 = f"{up:^13}"
                    c2 = f"{left:<6}{right:>7}"
                    c3 = f"{down:^13}"
                line1.append(c1)
                line2.append(c2)
                line3.append(c3)

            print("|" + "|".join(line1) + "|")
            print("|" + "|".join(line2) + "|")
            print("|" + "|".join(line3) + "|")
        print(horiz)
