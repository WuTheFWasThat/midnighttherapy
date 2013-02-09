import pathery
import random

def sample_num_blocks_to_move():
  return random.randint(1, 3)

def find_nearby_opening(i, j, graph, blocks):
  blocks = set(blocks)
  while (graph.can_place(i, j) and ((i, j) not in blocks)):
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

def compute_value_add(graph, blocks, num_to_place, cur_value):
  value_added = [0] * num_to_place
  for i in range(num_to_place):
    old = blocks[i]
    blocks[i] = (-1, -1)
    path, value = pathery.find_full_path(graph, blocks)
    value_added[i] = cur_value - value
    blocks[i] = old
  return value_added

def mcmc_solve(board, num_to_place):
  graph = pathery.Graph(board)

  path, value = pathery.find_full_path(graph, [])

  cur_blocks = [find_nearby_opening(path[0][0], path[0][1], graph, [])] * num_to_place
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

    if time_since_improving > 5000:
      # RESET.  Haven't found any improvements in too long
      cur_blocks = [find_nearby_opening(path[0][0], path[0][1], graph, [])] * num_to_place
      cur_path, cur_value = pathery.find_full_path(graph, cur_blocks)
      time_since_improving = 0

    new_blocks = [x for x in cur_blocks]

    if random.random() * num_to_place < 1:
      # Move useless blocks.  Do this rarely, since it's expensive
      value_add = compute_value_add(graph, cur_blocks, num_to_place, cur_value)
      indices = []
      for i in range(num_to_place):
        if random.random() * value_add[i] < 1:
          indices.append(i)
      new_block = get_random_opening(graph, cur_path)
      for index in indices:
        new_blocks[index] = find_nearby_opening(new_block[0], new_block[1], graph, new_blocks)
        
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
