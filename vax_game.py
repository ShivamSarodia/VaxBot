import networkx as nx
import random

class VaxGame:
    """Stores the state of the Vax game, including the main graph.

    stage - stage of main game (see enum below)
    graph - main game NetworkX graph object
    status - an array indexed by node integer of node state (see enum below)

    orig_num_nodes - original number of nodes
    num_outbreaks - number of original infections

    num_vaccines - current number of vaccines remaining
    num_people - current number of individuals altogether
    num_infected - current number of infected individuals
    num_healthy - current number of healthy individuals

    """

    # const enum for node status
    HEALTHY = 0
    INFECTED = 1
    GONE = 2

    # const enum for game stage
    VACCINE = 0
    QUARANTINE = 1
    DONE = 2

    def __init__(self, num_nodes, mean_degree, rand_edges, num_vaccines,
                 num_outbreaks):
        """Initialize a new game.

        num_nodes - initial number of nodes added
        mean_degree - the mean degree of each node
        rand_edges - number from 0 to 1, higher randomizes the edges more
        num_vaccines - number of vaccines to give
        num_outbreaks - number of original infections

        """

        self.stage = self.VACCINE
        self.orig_num_nodes = num_nodes
        self.num_vaccines = num_vaccines
        self.num_outbreaks = num_outbreaks
        self.num_infected = 0

        self._setup_graph(num_nodes, mean_degree, rand_edges)

    @classmethod
    def easy_game(cls):
        """Generate and return an easy VaxGame object."""
        return cls(50, 3, 0.1, 5, 1)

    @classmethod
    def medium_game(cls):
        """Generate and return a medium VaxGame object."""
        return cls(75, 4, 0.1, 7, 2)

    @classmethod
    def hard_game(cls):
        """Generate and return a hard VaxGame object."""
        raise NotImplementedError("refusers unimplemented")

    @property
    def num_healthy(self):
        return self.graph.number_of_nodes() - self.num_infected

    @property
    def num_people(self):
        return self.graph.number_of_nodes()

    def _setup_graph(self, num_nodes, mean_degree, rand_edges):
        """Set up the graph based on the given parameters."""
        self.graph = nx.Graph()
        self.graph.add_nodes_from(list(range(num_nodes)))
        self.status = [self.HEALTHY] * num_nodes

        # Add some of the edges deterministically
        all_edges = []
        for n in self.graph:
            for e in range(mean_degree):
                # Get index of other node to which this connects
                diff = (1 if e % 2 == 1 else -1) * (e // 2 + 1)
                other_node = (n + diff) % num_nodes
                all_edges.append((n, other_node))

        # Add some edges randomly
        for i, edge in enumerate(all_edges):
            if random.random() < rand_edges:
                # Replace the target of this edge with a randomly selected node
                source = edge[0]
                while True:
                    target = int(random.random() * num_nodes)
                    if target != source:
                        all_edges[i] = (source, target)
                        break

        # Remove duplicate edges - this uses the exact same algorithm as the
        # online game for consistency.
        seen_edges = []
        for edge in all_edges:
            if edge not in seen_edges and (edge[1], edge[0]) not in seen_edges:
                seen_edges.append(edge)

        self.graph.add_edges_from(seen_edges)

    def click(self, node):
        """Vaccinate or quarantine given node. Raises exception on invalid
        operation."""
        if self.stage == self.VACCINE:
            self.graph.remove_node(node)
            self.status[node] = self.GONE

            self.num_vaccines -= 1

            # Detect beginning of quarantine stage
            if self.num_vaccines == 0:
                self.stage = self.QUARANTINE

                while self.num_infected < self.num_outbreaks:
                    n = random.choice(self.graph.nodes())
                    if self.status[n] == self.HEALTHY:
                        self.status[n] = self.INFECTED
                        self.num_infected += 1

        elif self.stage == self.QUARANTINE:
            if self.status[node] == self.HEALTHY:
                self.graph.remove_node(node)
                self.status[node] = self.GONE

                if not self._spread_disease(0.35):
                    self._spread_disease(1)

                # set self.stage to done, and reset it if we find an uninfected
                # neighbor of an infected node
                self.stage = self.DONE
                for n in self.graph:
                    if self.status[n] != self.INFECTED: continue
                    if any(self.status[v] == self.HEALTHY for v in self.graph[n]):
                        self.stage = self.QUARANTINE
                        break
            else:
                raise RuntimeError("can only remove healthy nodes")

        elif self.stage == self.DONE:
            raise RuntimeError("game is done")

    def _spread_disease(self, transmission_rate):
        """Spread the disease with given transmission rate. Return the number
        of new infections."""

        to_infect = []
        for v in self.graph:
            if self.status[v] != self.HEALTHY: continue

            neighbors_infected = sum(1 for n in self.graph[v]
                                     if self.status[n] == self.INFECTED)

            if transmission_rate == 1:
                p_infect = 1 if neighbors_infected else 0
            else:
                p_infect = 1 - (1 - transmission_rate) ** neighbors_infected

            if random.random() < p_infect: to_infect.append(v)

        for v in to_infect: self.status[v] = self.INFECTED
        self.num_infected += len(to_infect)
        return len(to_infect)

    def display(self):
        """Display the graph and print game info."""

        raise NotImplementedError("not updated for networkx")

        if self.stage == self.VACCINE:
            print("Vaccines remaining: ", self.num_vaccines)
        elif self.stage == self.QUARANTINE:
            print("Num infected: ", self.num_infected)
        elif self.stage == self.DONE:
            print("Game over!")
            print("Num infected: ", self.num_infected)

        # node_sizes = []
        # node_colors = []
        # for v in self.graph.vertices():
        #     if self.status[v] == self.INFECTED: self._color[v] = (1,0,0,1)
        #     else: self._color[v] = (0.7,0.7,0.7,1)

        # deg = gt.draw.prop_to_size(self.graph.degree_property_map("total"),
        #                            mi=10, ma=30, power=1.1)
        # gt.draw.graph_draw(self.graph, vertex_size=deg,
        #                    vertex_text=self.graph.vertex_index,
        #                    vertex_fill_color=self._color,
        #                    vertex_color=(0,0,0,0.8))

        nx.draw(self.graph)
