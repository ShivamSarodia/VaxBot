import graph_tool.topology as topo
import numpy as np
import random

from vax_game import GameState

class Bot:
    """Abstract class for a Vax bot. Users must implement the turn()
    function, or can alternatively override the play() function."""

    def __init__(self, game):
        """Initialize the bot with the given GameState object"""
        self.game = game

    def play(self):
        """Play the game and return the number saved."""

        while self.game.stage != self.game.DONE:
            self.turn()

        return self.game.orig_num_nodes - self.game.num_infected

    def turn(self):
        """Make one click on the given GameState object."""
        raise NotImplementedError

def run(BotType, repeat=1):
    """Run the given bot `repeat` number of times on an easy game, and
    return a list of the number saved in each run.
    """
    return [BotType(GameState.medium_game()).play() for i in range(repeat)]



class UtilBot(Bot):
    """Abstract class defining some useful bot utilities."""

    def high_degree_click(self):
        """Click any node of highest degree."""
        i = np.argmax(self.game.graph.degree_property_map("total").a)
        self.game.click(self.game.graph.vertex(i))

    def random_click(self):
        """Randomly click a healthy node."""
        vs = [v for v in self.game.graph.vertices()
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
                        sum(1 for n in v.all_neighbours()
                           if self.game.status[n] == self.game.INFECTED))

            vs = [v for v in self.game.graph.vertices() if is_ok(v)]
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
            dist = self.game.graph.new_vertex_property("int", 100)
            score = self.game.graph.new_vertex_property("float", 0)

            infected = [v for v in self.game.graph.vertices()
                        if self.game.status[v] == self.game.INFECTED]
            for v in self.game.graph.vertices():
                if self.game.status[v] == self.game.INFECTED: continue

                # Get the minimum distance from v to an infected node
                dist[v] = topo.shortest_distance(self.game.graph, v,
                                                 infected).min()

            deg = self.game.graph.degree_property_map("total")
            score.a = self.k * deg.a - np.power(dist.a, self.p)

            i = np.random.choice(np.where(score.a == score.a.max())[0])
            self.game.click(self.game.graph.vertex(i))
