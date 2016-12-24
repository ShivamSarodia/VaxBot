import graph_tool as gt
import graph_tool.draw
import random

class GameState:
    """Stores the state of the Vax game, including the main graph.

    stage - stage of main game (see enum below)

    graph - main game graph
    status - the vertex property for node status (see enum below)

    num_vaccines - number of vaccines remaining
    num_outbreaks - number of original infections

    num_infected - total number of infected individuals

    """

    # const enum for node status
    HEALTHY = 0
    INFECTED = 1

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

        num_vaccines - number of vaccines remaining
        num_outbreaks - number of original infections

        num_infected - total number of infected individuals

        """

        self.stage = self.VACCINE
        self.num_vaccines = num_vaccines
        self.num_outbreaks = num_outbreaks
        self.num_infected = 0

        self._setup_graph(num_nodes, mean_degree, rand_edges)

    @classmethod
    def easy_game(cls):
        """Generate and return an easy GameState object."""
        return cls(50, 3, 0.1, 5, 1)

    @classmethod
    def medium_game(cls):
        """Generate and return a medium GameState object."""
        return cls(75, 4, 0.1, 7, 2)

    @classmethod
    def hard_game(cls):
        """Generate and return a hard GameState object."""
        raise NotImplementedError("Refusers unimplemented")

    def _setup_graph(self, num_nodes, mean_degree, rand_edges):
        """Set up the graph based on the given parameters."""
        self.graph = gt.Graph(directed=False)
        self.status = self.graph.new_vertex_property("int", val=self.HEALTHY)

        # To be used for displaying the graph.
        self._color = self.graph.new_vertex_property("vector<double>")

        # Add all nodes
        self.graph.add_vertex(num_nodes)

        # Add some of the edges deterministically
        all_edges = []
        for i, node in enumerate(self.graph.vertices()):
            for e in range(mean_degree):
                # Get index of other node to which this connects
                diff = (1 if e % 2 == 1 else -1) * (e // 2 + 1)
                other_node = self.graph.vertex((i + diff) % num_nodes)
                all_edges.append((node, other_node))

        # Add some edges randomly
        for i, edge in enumerate(all_edges):
            if random.random() < rand_edges:
                # Replace the target of this edge with a randomly selected node
                source = edge[0]
                while True:
                    target = self.graph.vertex(int(random.random() * num_nodes))
                    if target != source:
                        all_edges[i] = (source, target)
                        break

        # Remove duplicate edges - this uses the exact same algorithm as the
        # online game for consistency.
        seen_edges = []
        for edge in all_edges:
            if edge not in seen_edges and (edge[1], edge[0]) not in seen_edges:
                seen_edges.append(edge)

        for edge in seen_edges:
            self.graph.add_edge(edge[0], edge[1])

    def click(self, node):
        """Vaccinate or quarantine given node. Raises exception on invalid
        operation."""
        if self.stage == self.VACCINE:
            self.graph.remove_vertex(node)
            self.num_vaccines -= 1

            if self.num_vaccines == 0:
                self.stage = self.QUARANTINE

                while self.num_infected < self.num_outbreaks:
                    n = self.graph.vertex(
                        random.randint(0, self.graph.num_vertices()))
                    if self.status[n] == self.HEALTHY:
                        self.status[n] = self.INFECTED
                        self.num_infected += 1

        elif self.stage == self.QUARANTINE:
            if self.status[node] == self.HEALTHY:
                self.graph.remove_vertex(node)
                if not self._spread_disease(0.35):
                    self._spread_disease(1)

                # Check if game is over by counting number of uninfected
                # neighbors of infected nodes.
                if sum(sum(1 for n in v.all_neighbours()
                           if self.status[n] != self.INFECTED)
                       for v in self.graph.vertices()
                       if self.status[v] == self.INFECTED) == 0:
                    self.stage = self.DONE

            else:
                raise RuntimeError("can only remove healthy nodes")

        elif self.stage == self.DONE:
            raise RuntimeError("game is done")

    def _spread_disease(self, transmission_rate):
        """Spread the disease with given transmission rate. Return the number
        of new infections."""

        to_infect = []
        for v in self.graph.vertices():
            if self.status[v] != self.HEALTHY: continue

            neighbors_infected = sum(1 for n in v.all_neighbours()
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

        if self.stage == self.VACCINE:
            print("Vaccines remaining: ", self.num_vaccines)
        elif self.stage == self.QUARANTINE:
            print("Num infected: ", self.num_infected)
        elif self.stage == self.DONE:
            print("Game over!")
            print("Num infected: ", self.num_infected)

        for v in self.graph.vertices():
            if self.status[v] == self.INFECTED: self._color[v] = (1,0,0,1)
            else: self._color[v] = (0.7,0.7,0.7,1)

        deg = gt.draw.prop_to_size(self.graph.degree_property_map("total"),
                                   mi=10, ma=30, power=1.1)
        gt.draw.graph_draw(self.graph, vertex_size=deg,
                           vertex_text=self.graph.vertex_index,
                           vertex_fill_color=self._color,
                           vertex_color=(0,0,0,0.8))
