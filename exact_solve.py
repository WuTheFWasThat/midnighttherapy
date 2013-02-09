import pathery

def exact_solve(board, remaining):
  graph = pathery.Graph(board)
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

