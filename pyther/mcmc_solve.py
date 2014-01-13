import pathery
import random

def sample_num_blocks_to_move():
  return random.randint(1, 3)

def find_nearby_opening(i, j, graph, blocks):
  blocks = set(blocks)
  while ((not graph.can_place(i, j)) or ((i, j) in blocks)):
    i += random.randint(-1, 1)
    if i >= graph.n: i = graph.n - 1
    if i < 0: i = 0
    j += random.randint(-1, 1)
    if j >= graph.m: j = graph.m - 1
    if j < 0: j = 0
  return (i, j)

def get_random_opening(graph, cur_path):
  new_block = cur_path[random.randint(0, len(cur_path) -1)]
  while (not graph.can_place(new_block[0], new_block[1])):
    new_block = cur_path[random.randint(0, len(cur_path) -1)]
  return new_block

# Returns list of values for the blocks currently placed
def compute_value_minus(graph, blocks, cur_value):
  value_minused = []
  for i in range(len(blocks)):
    block = blocks[i]
    blocks[i] = (-1, -1)
    path, value = pathery.find_full_path(graph, blocks)
    value_minused.append((cur_value - value, block))
    blocks[i] = block
  value_minused.sort()
  return value_minused

# Returns sorted list of (value_add, block) pairs, for blocks to potentially place on the current path
def compute_value_add(graph, blocks, cur_path, cur_value):
  cur_path_unique = list(set(cur_path))
  value_added = []
  for block in cur_path_unique:
    blocks.append(block)
    path, value = pathery.find_full_path(graph, blocks)
    blocks.pop()
    if value is None:
      value_added.append((-1, block))
    else:
      value_added.append((value - cur_value, block))
  value_added.sort()
  return value_added

def mcmc_solve(board, num_to_place):
  graph = pathery.Graph(board)

  path, value = pathery.find_full_path(graph, [])

  # initially, place all blocks at some random place on the path
  i = random.randint(0, len(path)-1) 
  cur_blocks = [find_nearby_opening(path[i][0], path[i][1], graph, [])] * num_to_place
  cur_path, cur_value = pathery.find_full_path(graph, cur_blocks)

  memo = {}

  best_blocks = cur_blocks
  best_value = cur_value
  best_path = cur_path
  time_since_improving = 0

  for iter in range(100000):
    if iter % 100 == 0:
      print graph.draw(cur_blocks)
      print cur_value
    if iter % 1000 == 0:
      print "***********************************"
      print "BEST"
      print "***********************************"
      print graph.draw(best_blocks)
      print best_value

    if time_since_improving > 1000:
      # RESET.  Haven't found any improvements in too long
      cur_blocks = [find_nearby_opening(path[0][0], path[0][1], graph, [])] * num_to_place
      cur_path, cur_value = pathery.find_full_path(graph, cur_blocks)
      time_since_improving = 0

    new_blocks = [x for x in cur_blocks]

    if ((iter % num_to_place == 0) or (time_since_improving < 10)):
      # Move useless blocks.  Do this rarely, since it's expensive
      value_minus = compute_value_minus(graph, cur_blocks, cur_value)
      # We will try to move them to the most valuable places.
      value_add = compute_value_add(graph, cur_blocks, cur_path, cur_value)

      take_index = -1
      for i in range(num_to_place):
        if random.random() * value_minus[i][0] < 1:
          take_index = i
          break

      put_index = -1
      for i in range(len(value_add)):
        if random.random() * value_add[i][0] > 1:
          put_index = i
          break

      new_block = get_random_opening(graph, cur_path)
      new_blocks[take_index] = value_add[put_index][1]
        
    elif random.random() < 0.3:
      # Move some number of blocks in a contiguous wall in front of the path somewhere
      num_blocks_to_move = sample_num_blocks_to_move();
  
      start_index = random.randint(0, num_to_place - num_blocks_to_move)
      new_block = get_random_opening(graph, cur_path)
      new_blocks[start_index] = new_block
  
      for index in range(start_index + 1, start_index + num_blocks_to_move):
        new_blocks[index] = find_nearby_opening(new_block[0], new_block[1], graph, new_blocks)
    else:
      # Perturb a single block
      index = random.randint(0, num_to_place - 1)
      block = new_blocks[index]
      new_blocks[index] = find_nearby_opening(block[0], block[1], graph, new_blocks)

    frozen_new_blocks = frozenset(new_blocks)
    if frozen_new_blocks in memo:
      new_path, new_value = memo[frozen_new_blocks]
    else:
      new_path, new_value = pathery.find_full_path(graph, new_blocks)
      memo[frozen_new_blocks] = (new_path, new_value)

    if new_path is None: 
      time_since_improving += 1
      continue

    if (cur_path is None or (cur_value < new_value)):
      print "TIME", time_since_improving
      time_since_improving = 0
    else:
      time_since_improving += 1

    # greedy

    if (best_path is None) or (best_value < new_value):
      best_path = new_path
      best_value = new_value
      best_blocks = new_blocks

    if (cur_path is None) or (cur_value <= new_value):
      cur_path = new_path
      cur_value = new_value
      cur_blocks = new_blocks

    #if (random.random() * (len(best_path) - len(new_path))) < (len(best_path) - len(cur_path) + 1):
    #  cur_path = new_path
    #  cur_blocks = new_blocks

  return best_path, best_blocks
