import pathery
import time
import mcmc_solve
import exact_solve

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
num_to_place = 30
# BEST IS 188

board = ['s     X     t',
         's           t',
         's   X       t',
         'sX    X  X  t',
         's    A  XX  t',
         'sX         Xt',
         'sX X        t']
num_to_place = 9

graph = pathery.Graph(board)

if __name__ == '__main__':
  print graph
  print
  print "------------------------------------------------------------------------------"
  print
  
  
  print "SOLVING MONTE CARLO"
  t = time.time()
  path, blocks = mcmc_solve.mcmc_solve(board, num_to_place)
  print graph.draw(blocks)
  print len(path)
  t = time.time() - t
  print t, "seconds"
  
  print
  print "------------------------------------------------------------------------------"
  print
  
  # print "SOLVING EXACT"
  # t = time.time()
  # path, blocks = exact_solve.exact_solve(board, 3)
  # print graph.draw(blocks)
  # print len(path)
  # t = time.time() - t
  # print t, "seconds"
  # 
