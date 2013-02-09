import copy
import time
import random

teleports_map = {
  '1': '!',
  '2': '@',
  '3': '#',
  '4': '$',
  '5': '%',
  '6': '^',
  '7': '&',
  '8': '*',
  '9': '(',
  '0': ')',
}

class Graph:
  def __init__(self, board):
    self.board = board
    self.n, self.m = len(board), len(board[0])

    boardstuff = {}
    # Note that these lists start from top-left and go right, then down
    # In particular, starts and finishes are ordered top to bottom
    for i in range(self.n):
      for j in range(self.m):
        stuff = self.board[i][j]
        if stuff != ' ':
          if stuff in boardstuff:
            boardstuff[stuff].append((i, j))
          else:
            boardstuff[stuff] = [(i, j)]

    self.milestones = [] # list of lists of intermediate targets, including starts and ends
    self.milestones.append(boardstuff['s'])
    d = 65
    while chr(d) in boardstuff:
      self.milestones.append(boardstuff[chr(d)])
      d+=1
    self.milestones.append(boardstuff['t'])

    self.teleports = {}
    d = 1
    while str(d) in boardstuff:
      assert len(boardstuff[str(d)]) == 1
      assert len(boardstuff[teleports_map[str(d)]]) == 1
      self.teleports[boardstuff[str(d)][0]] = boardstuff[teleports_map[str(d)]][0]
      d+=1

  def get(self, block):
    return self.board[block[0]][block[1]]

  def get_neighbors(self, blocks, u):
    if u == None: # invisible 'meta-start' vertex
      return list(self.milestones[0]) # return the start vertices
    (x, y) = u
    neighbors = []
    # order here is important, as per pathery rules
    for (dx, dy) in [(-1, 0), (0, 1), (1, 0), (0, -1)]:
      xp, yp = x + dx, y + dy
      if (0 <= xp < self.n) and (0 <= yp < self.m):
        if (xp, yp) not in blocks and self.board[xp][yp] not in ['X', 'x', '*']:
          neighbors.append((xp, yp))
    return neighbors

  def teleport(self, block, used_teleports):
    stuff = self.get(block)
    if stuff in teleports_map:
      if block not in used_teleports:
        used_teleports.add(block)
        return self.teleports[block]
    return None

  def __str__(self):
    return self.draw()

  def draw(self, blocks = set()):
    str_array = []
    str_array.append('-' * (self.m * 4 + 1))
    for i in range(self.n):
      str_array.append('\n|')
      for j in range(self.m):
        str_array.append(' ')
        str_array.append(('*' if (i, j) in blocks else self.board[i][j]))
        str_array.append(' |')
      str_array.append('\n')
      str_array.append('-' * (self.m * 4 + 1))
    return ''.join(str_array)

def BFS(graph, # graph description, as an array
        blocks, # currently placed blocks
        source, # source vertex
        targets # set of target vertices
        ):
  blocks = set(blocks)
  parent = {}
  parent[source] = None
  queue = [source]

  def get_path(v):
    path = []
    while v is not None:
      path.append(v)
      v = parent[v]
    path.reverse()
    return path

  while queue:
    newqueue = []
    for u in queue:
      for v in graph.get_neighbors(blocks, u):
        if v not in parent:
          newqueue.append(v)
          parent[v] = u
        if v in targets:
          return get_path(v)
    queue = newqueue
  return None 

def find_full_path(graph, 
                   blocks, # set of currently placed blocks
                   ):
                   
  used_teleports = set() # set of used teleports
  index = 0
  fullpath = []
  cur = None

  while index < len(graph.milestones) - 1:
    best_path = None
    for target in graph.milestones[index+1]:
      path = BFS(graph, blocks, cur, set([target]))
      if best_path is None or (path is not None and len(path) < len(best_path)):
        best_path = path
    if best_path is None:
      return None, -float("Inf")
    out_block = None
    for block in best_path[(index != 0):]:
      fullpath.append(block)
      out_block = graph.teleport(block, used_teleports)
      if out_block is not None:
        cur = out_block
        break
    if out_block is None:
      index += 1
      cur = block
  return fullpath, len(fullpath) - len(used_teleports)
  
def exact_solve(board, remaining):
  graph = Graph(board)
  memo = {}

  def find_best_helper(graph, 
                       blocks, # currently placed blocks
                       remaining # remaining to place
                      ):
  
    if frozenset(blocks) in memo:
      return memo[frozenset(blocks)]

    # allow not placing any blocks
    path, value = find_full_path(graph, blocks)

    best_path = path
    best_value = value
    best_blocks = (None if path is None else blocks)

    if remaining != 0:
      if path is not None:
        for block in set(path):
          if graph.get(block) == ' ':
            newblocks = copy.copy(blocks)
            newblocks.add(block)
            newpath, newvalue, newblocks = find_best_helper(graph, newblocks, remaining - 1)
            if (newpath is not None) and (best_path is None or len(best_value) < len(newvalue)):
              best_path = newpath
              best_value = newvalue
              best_blocks = newblocks
    memo[frozenset(blocks)] = (best_path, best_blocks)
    return best_path, best_value, best_blocks
  
  return find_best_helper(graph, set([]), remaining)



# TODO: prioritize moving blocks small amount
# TODO: calculate usefulness of blocks on the fly, somehow?

def mcmc_solve(board, num):
  graph = Graph(board)

  path, value = find_full_path(graph, [])

  cur_blocks = [path[1]] * num
  cur_path, cur_value = find_full_path(graph, cur_blocks)

  memo = {}

  best_blocks = cur_blocks
  best_value = cur_value
  best_path = cur_path

  for iter in range(10000):
    if iter % 100 == 0:
      print graph.draw(cur_blocks)
      print len(cur_path)

    index = random.randint(0, num - 1)
    newblock = cur_path[random.randint(0, len(cur_path) -1)]
    if graph.board[newblock[0]][newblock[1]] != ' ':
      continue

    new_blocks = [x for x in cur_blocks]
    new_blocks[index] = newblock

    frozen_new_blocks = frozenset(new_blocks)
    if frozen_new_blocks in memo:
      new_path = memo[frozen_new_blocks]
    else:
      new_path, new_value = find_full_path(graph, new_blocks)
      memo[frozen_new_blocks] = new_path

    if new_path is None:
      continue

    if (best_path is None) or (best_value <= new_value):
      best_path = new_path
      best_value = new_value
      best_blocks = new_blocks

    # greedy
    if (cur_path is None) or (cur_value <= new_value):
      cur_path = new_path
      cur_value = new_value
      cur_blocks = new_blocks

    #if (random.random() * (len(best_path) - len(new_path))) < (len(best_path) - len(cur_path) + 1):
    #  cur_path = new_path
    #  cur_blocks = new_blocks


  return best_path, best_blocks


board = ['s   X      XXX    t',
         's            1 **Xt',
         's  C      X   *   t',
         's        *   X    t',
         's  X   @* X *     t',
         's      *   X      t',
         's   !*X   2   A   t',
         's  **      *      t',
         's *B DX           t']

board = ['s                 t',
         's                 t',
         's X   X     X     t',
         's  X              t',
         's A         !     t',
         'sX  X             t',
         's                 t',
         's                 t',
         's X    X          t',
         's             XX  t',
         's                 t',
         's  X X 1     X    t',
         's     X        X  t',
         's                 t']






graph = Graph(board)

print graph
print
print "------------------------------------------------------------------------------"
print


print "SOLVING MONTE CARLO"
t = time.time()
path, blocks = mcmc_solve(board, 30)
print graph.draw(blocks)
print len(path)
t = time.time() - t
print t, "seconds"

print
print "------------------------------------------------------------------------------"
print

# print "SOLVING EXACT"
# t = time.time()
# path, blocks = exact_solve(board, 3)
# print graph.draw(blocks)
# print len(path)
# t = time.time() - t
# print t, "seconds"
# 
