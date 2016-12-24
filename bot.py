import graph_tool.topology
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
    return [BotType(GameState.easy_game()).play() for i in range(repeat)]



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

# class DistanceBot(UtilBot):
#     def turn(self):
#         if self.game.stage == self.game.VACCINE:
#             self.high_degree_click()
#         else:
#             gt.topology.shortest_distance(self.game.graph,
#                                           target=)
