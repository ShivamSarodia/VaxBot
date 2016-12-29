import networkx as nx
import numpy as np
import random
import time

from vax_game import VaxGame

class Bot:
    """Abstract class for a Vax bot. Users must implement the turn()
    function, or can alternatively override the play() function."""

    def __init__(self, game):
        """Initialize the bot with the given VaxGame object"""
        self.game = game

    def play(self):
        """Play the game and return the number saved."""

        while self.game.stage != self.game.DONE:
            self.turn()

        return self.game.orig_num_nodes - self.game.num_infected

    def turn(self):
        """Make one click on the given VaxGame object."""
        raise NotImplementedError

def run(BotType, repeat=1, game_generator=VaxGame.easy_game, show_stats=False):
    """Run the given bot repeatedly, and return a numpy array of the number
    saved in each run.

    repeat - number of times to run the bot
    game_generator - a function that returns a VaxGame which the bot will play

    """
    start_time = time.time()

    runs = np.array([BotType(game_generator()).play() for _ in range(repeat)])
    if show_stats:
        print("Mean:", runs.mean())
        print("StdErr:", runs.std() / np.sqrt(repeat))
        print("Time: ", time.time() - start_time)

    return runs

class UtilBot(Bot):
    """Abstract class defining some useful bot utilities."""

    def high_degree_click(self):
        """Click any node of highest degree."""
        deg = self.game.graph.degree()
        self.game.click(max(deg, key=lambda x: deg[x]))

    def random_click(self):
        """Randomly click a healthy node."""
        vs = [v for v in self.game.graph
              if self.game.status[v] == self.game.HEALTHY]
        self.game.click(random.choice(vs))

class RandomBot(UtilBot):
    """Randomly select a node to remove each turn."""

    def turn(self):
        self.random_click()

class DegreeBot(UtilBot):
    """For vaccination pase, remove nodes of highest degree. For quarantine
    phase remove nodes randomly."""

    def turn(self):
        if self.game.stage == self.game.VACCINE:
            self.high_degree_click()
        else:
            self.random_click()

class NearbyBot(UtilBot):
    """For vaccination phase, remove nodes of highest degree. For
    quarantine phase, remove a node touching an infected person."""

    def turn(self):
        if self.game.stage == self.game.VACCINE:
            self.high_degree_click()
        else:
            def is_ok(v):
                """Is this node healthy and has infected neighbors"""
                return (self.game.status[v] == self.game.HEALTHY and
                        any(self.game.status[n] == self.game.INFECTED
                            for n in self.game.graph[v]))

            vs = [v for v in self.game.graph.nodes() if is_ok(v)]
            self.game.click(random.choice(vs))

class DistanceBot(UtilBot):
    # Parameter that controls how much degree factors into decision of
    # which nodes to quarantine. Higher -> degree plays bigger role.

    k = 1
    p = 2

    @classmethod
    def params(cls, k, p):
        cls.k = k
        cls.p = p
        return cls

    def turn(self):
        if self.game.stage == self.game.VACCINE:
            self.high_degree_click()
        else:
            # distance to nearest infected node, start very high
            inf_dist = [100] * self.game.orig_num_nodes
            paths = nx.shortest_path_length(self.game.graph)

            for n in paths:
                if self.game.status[n] == self.game.HEALTHY: continue
                for v in paths[n]:
                    inf_dist[v] = min(inf_dist[v], paths[n][v])

            deg = self.game.graph.degree()

            # Calculate score for each healthy node
            score = np.zeros(self.game.orig_num_nodes)
            for i in range(self.game.orig_num_nodes):
                if self.game.status[i] == self.game.HEALTHY:
                    score[i] = self.k * deg[i] - np.power(inf_dist[i], self.p)

            # Remove unhealthy nodes from consideration by assigning low score
            min_val = score.min() - 1
            for i in range(len(self.game.status)):
                if self.game.status[i] != self.game.HEALTHY:
                    score[i] = min_val

            i = np.random.choice(np.where(score == score.max())[0])
            self.game.click(i)
