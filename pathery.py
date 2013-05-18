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
      self.teleports[boardstuff[str(d)][0]] = boardstuff[teleports_map[str(d)]]
      d+=1

  def can_place(self, i, j):
    return (self.board[i][j] == ' ')

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

  t = time.time()
  while index < len(graph.milestones) - 1:
    best_path = None
    for target in graph.milestones[index+1]:
      path = BFS(graph, blocks, cur, set([target]))
      if best_path is None or (path is not None and len(path) < len(best_path)):
        best_path = path
    if best_path is None:
      return None, -float("Inf")
    out_blocks = None
    for block in best_path[(index != 0):]:
      fullpath.append(block)
      out_blocks = graph.teleport(block, used_teleports)
      if out_blocks is not None:
        # TODO: MULTIPLE OUTS
        cur = out_blocks[0]
        break
    if out_blocks is None:
      index += 1
      cur = block
  #print "time.time() - t"
  #print time.time() - t
  return fullpath, len(fullpath) - len(used_teleports) - 1
  
