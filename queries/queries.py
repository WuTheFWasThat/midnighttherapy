
import requests
import json
import datetime

from subprocess import call

import numpy as np
import matplotlib.pyplot as plt

# domain = 'http://beta.pathery.net';
# domain = 'http://blue.pathery.net';
domain = 'http://www.pathery.com';

clear_cache = False

cache_location = 'queries/cached_queries'
if clear_cache:
    call(['rm', '-rf', cache_location])
    call(['mkdir', '-p', cache_location])

ALL_MAP_TYPES = [
  'Simple',
  'Normal',
  'Complex',
  'Reverse Order',
  'Dualing paths',
  'Side to Side',
  'Thirty',
  'Unlimited',
  'Centralized',
  'Seeing Double',
  'Teleport Madness',
  'Rocky Maze',
  'Ultimate Random',
  'Finite',
  'Thirty Too',
  "ABC's ",
  'Ultra Complex',
]



f = open('queries/user_id_map.json')
user_id_map = json.loads(f.read())

id_user_map = {}
for i in user_id_map:
  id_user_map[user_id_map[i]] = i

def user_string_from_id(id):
  return id_user_map.get(id, 'anon:%s' % str(id))

###########################
# PRINT UTILS
###########################

def isodate(date):
  return date.isoformat().split('T')[0]

###########################
# REQUESTS
###########################
# see for API :
# http://forums.pathery.com/showthread.php?tid=3

# TODO: dont cache requests that could change, i.e. are from today



request_cache = {} # in-memory cache
def make_request(url):
  cache_file = cache_location + '/' + url.replace(':', '_').replace('/','_') + '.json'
  if url in request_cache:
    # cached in memory
    return request_cache[url]
  try:
    # cached in file
    f = open(cache_file)
    ans = json.loads(f.read())
    request_cache[url] = ans
    return ans
  except:
    try:
      r = requests.get(url)
      ans = json.loads(r.text)
      with open(cache_file, 'w') as outfile:
        json.dump(ans, outfile)
      request_cache[url] = ans
      return ans
    except:
      return None

scores_cache = {}
def get_scores(mapid, page):
  index = str(mapid) + '_' + str(page)
  return make_request(domain + '/a/score/' + index + '.js')

def get_map_info(mapid):
  return make_request(domain + '/a/map/' + str(mapid) + '.js')

def get_map_type(mapid):
  try:
    maptype = get_map_info(mapid)[u'name']
    return str(maptype)
  except:
    return None

def get_map_rank(maptype):
  if maptype == 'Simple':
    return maptype
  elif maptype == 'Normal':
    return maptype
  elif (maptype == 'Complex') or (maptype == 'Reverse Order'):
    return 'Complex/RO'
  elif (maptype == 'Ultra Complex'):
    return maptype
  else:
    return '4th map'

###############################
# various helper functions
###############################

def get_mapcodes_of_type(maptype = None):
  mapid = get_todays_mapids()[3]
  while mapid > 0:
    info = get_map_info(mapid)
    if info:
      if (maptype == None) or (str(info[u'name']) == maptype):
        print info[u'code']
    mapid -= 1

# get mapids for a day
def get_mapids(date):
  r = requests.get(domain + '/a/mapsbydate/' + isodate(date) + '.js')
  return json.loads(r.text)

def get_todays_mapids():
  now = datetime.datetime.now()
  return get_mapids(now)

def find_nth_helper(mapid, n = 1):
  page = (n-1) / 10 + 1

  r = get_scores(mapid, page)
  if u'users' not in r:
    print 'users not in scores page?', mapid, r
    return None

  try:
    s = get_scores(mapid, page)[u'users'][str(n)]
  except:
    return None
  if u'moves' not in s:
    print 'wtf first page has no users list ', s
    return None
  return s

def find_nth_score(mapid, n = 1):
  res = find_nth_helper(mapid, n)
  return None if (res is None) else int(res[u'moves'])

def find_nth_user(mapid, n = 1):
  res = find_nth_helper(mapid, n)
  return None if (res is None) else int(res[u'ID'])

def find_nth_display(mapid, n = 1):
  return user_string_from_id(find_nth_user(mapid, n))

def find_nth_time(mapid, n = 1):
  res = find_nth_helper(mapid, n)
  if res is None:
    return None
  time = res[u'cdate']
  return time

# get mapid's best's info

def find_max_helper(mapid):
  return find_nth_helper(mapid, 1);

def find_max_score(mapid):
  return find_nth_score(mapid, 1);

def find_max_user(mapid):
  return find_nth_user(mapid, 1);

def find_max_display(mapid):
  return find_nth_display(mapid, 1);

def find_fastest_time(mapid):
  return find_nth_time(mapid, 1);

def time_to_seconds(strtime):
  arr = strtime.split(' ')[1].split(':')
  if strtime is None:
      return None

  seconds = int(arr[0]) * 60 * 60 + int(arr[1]) * 60 + int(arr[2])
  return seconds

def time_to_datetime(strtime):
  parts = strtime.split(' ')
  d = map(int, parts[0].split('-'))
  t = map(int, parts[1].split(':'))
  dt = datetime.datetime(d[0], d[1], d[2], t[0], t[1], t[2])
  return dt

def find_time_taken(mapid, maptype):
  strtime = find_fastest_time(mapid)
  if strtime is None:
      return None

  dt = time_to_datetime(strtime)
  if maptype == 'Ultra Complex':
      # hack to move start time to monday
      dt = dt + datetime.timedelta(hours = 12)
      days = dt.date().weekday()
      return dt - datetime.datetime(dt.year, dt.month, dt.day) + datetime.timedelta(days = days)
  else:
      return dt - datetime.datetime(dt.year, dt.month, dt.day)

# find a give users' performance on a given map
def find_user_helper(mapid, userid):
  page = 1
  while True:
    s = get_scores(mapid, page)
    if u'users' not in s: # reached last page
      return None
    for i in range(10):
      rank = (page-1) * 10 + i + 1
      if str(rank) not in s[u'users']:
        return None
      if s[u'users'][str(rank)][u'ID'] == str(userid):
        return (rank, s[u'users'][str(rank)])
    page += 1

def find_user_score(mapid, userid):
  res = find_user_helper(mapid, userid)
  return None if (res is None) else int(res[1][u'moves'])

def find_user_time(mapid, userid):
  res = find_user_helper(mapid, userid)
  if res is None:
    time = None
  else:
    time_arr = [int(x) for x in str(res[1][u'cdate']).split(' ')[1].split(':')]
    time = time_arr[0] * 60 * 60 + time_arr[1] * 60 + time_arr[2]
  return time

def find_user_points(mapid, userid):
  res = find_user_helper(mapid, userid)
  return None if (res is None) else int(res[1][u'points'])

def find_user_rank(mapid, userid):
  res = find_user_helper(mapid, userid)
  return None if (res is None) else res[0]

def get_num_ties(mapid):
  maxscore = find_max_score(mapid)
  score = maxscore
  n = 2
  while score == maxscore:
    score = find_nth_score(mapid, n)
    n = n + 1
  return n - 2

###############################
# useful routines
###############################

# find the missed maps of a user
def find_missed_maps(user, include_unattempted = True):
  userid = user_id_map[user]
  mapid = get_todays_mapids()[3]

  unattempted_start = None
  tied_streak_start = None

  while mapid > -1:
    user_score = find_user_score(mapid, userid)
    max_score = find_max_score(mapid)
    map_type = get_map_type(mapid)

    if user_score is None:
        if unattempted_start is None:
              unattempted_start = mapid
    else:
        if unattempted_start is not None:
            if include_unattempted:
                print 'unattempted:', unattempted_start, '-', mapid
            unattempted_start = None

        if user_score == max_score:
            if tied_streak_start is None:
                tied_streak_start = mapid
        else:
            if tied_streak_start is not None:
                print 'tied:', tied_streak_start, '-', mapid, '#maps: ', (mapid - tied_streak_start + 1)
                tied_streak_start = None
            print 'unmaxed:', mapid, map_type, user_score, '<', max_score

    mapid -= 1

def get_extremal_total_days(maptype = None):
  date = datetime.datetime.now()
  maxtotal = 0
  mintotal = 1000
  while True:
    mapids = get_mapids(date)[:4]
    maps = [(get_map_type(mapid), find_max_score(mapid)) for mapid in mapids]
    total = sum(score for (type, score) in maps)
    if total > maxtotal:
        print 'max ever: ', total
        print maps
        maxtotal = total
    if total < mintotal:
        print 'min ever: ', total
        print maps
        mintotal = total

    date -= datetime.timedelta(days=1)


# get score distribution
def get_score_distribution(maptype = None):
  mapid = get_todays_mapids()[3] + 1
  scores = []

  max_ever = None
  min_ever = None
  while mapid > -1:

    mapid -= 1
    if (maptype is not None) and (maptype != get_map_type(mapid)):
      continue
    score = find_max_score(mapid)

    if max_ever is None or score > max_ever:
      print 'max ever', mapid, score
      max_ever = score
    if min_ever is None or score < min_ever:
      print 'min ever', mapid, score
      min_ever = score

    if score is None:
      continue
    score = int(score)
    scores.append(score)
  plt.hist(scores)
  plt.show()

# get the distribution of ranks for a user
def get_rank_distribution(users, max_care_about = 10):
  ranks = [[0] * max_care_about for i in range(len(users))]
  mapid = get_todays_mapids()[3]
  while mapid > -1:
    for i in range(len(users)):
      user_rank = find_user_rank(mapid, user_id_map[users[i]])
      if (user_rank is not None) and (user_rank <= max_care_about):
        ranks[i][user_rank - 1] += 1
    print '---------------'
    for i in range(len(users)):
      print users[i].ljust(5), ranks[i]
    mapid -= 1

def find_sweeps():
  sweepers = {}
  date = datetime.datetime.now()
  while True:
    mapids = get_mapids(date)[:4]
    potential_sweeper = find_max_user(mapids[0])
    for mapid in mapids:
      if (potential_sweeper != find_max_user(mapid)):
        potential_sweeper = None
        break
    if potential_sweeper is not None:
      user = user_string_from_id(potential_sweeper)
      print user.ljust(20), 'swept on day', isodate(date)
      sweepers[user] = sweepers.get(user, 0) + 1
      print_leaderboard(sweepers)
      print
    date -= datetime.timedelta(days=1)

def find_sweep_stoppers(user=None):
  if user is not None:
    userid = user_id_map[user]

  def collect_counts(arr):
    last = None
    count = 0
    result = []

    for i in sorted(arr):
      if i == last:
        count += 1
      else:
        if count > 0:
          result.append((count, last))
        last = i
        count = 1
    if count > 0:
      result.append((count, last))
    return result


  date = datetime.datetime.now()
  while True:
    mapids = get_mapids(date)[:4]
    winners = [find_max_user(mapid) for mapid in mapids]
    counted = list(reversed(sorted(collect_counts(winners))))
    if counted[0][0] == 3:
      winner = user_string_from_id(counted[0][1])
      stopper = user_string_from_id(counted[1][1])
      if winner == user or user == None:
        print winner.ljust(20), 'got 3 wins on day ', isodate(date), ' (stopped by ', stopper, ')'
    date -= datetime.timedelta(days=1)

def find_win_amounts(user):
  userid = user_id_map[user]
  date = datetime.datetime.now()
  counts = [0] * 4

  while True:
    mapids = get_mapids(date)[:4]
    nwins = 0
    for mapid in mapids:
      if find_max_user(mapid) == userid:
        nwins += 1
    if nwins > 0:
      counts[nwins -1] += 1
      print nwins, 'wins on day', isodate(date)
      print counts
    date -= datetime.timedelta(days=1)

def find_win_types(user):
  userid = user_id_map[user]
  mapid = get_todays_mapids()[3]
  type_count = {}
  rank_count = {}
  total = 0
  while mapid > -1:
    if find_max_user(mapid) == userid:
      maptype = get_map_type(mapid)
      maprank = get_map_rank(maptype)
      total += 1
      if maptype in type_count:
        type_count[maptype] += 1
      else:
        type_count[maptype] = 1
      if maprank in rank_count:
        rank_count[maprank] += 1
      else:
        rank_count[maprank] = 1
      print '--------'
      print 'Won:', mapid, maptype
      print '--------'
      print 'total', total
      print 'breakdown', type_count
      print 'summary', rank_count
    mapid -= 1

# takes a dictionary of the form {user: count} and prints it sorted
def print_leaderboard(d, options={}):
  if 'top' not in options:
    options['top'] = 30

  l = []
  for user in d:
    l.append((d[user], user))
  l.sort((lambda x,y:  y[0]-x[0]))

  for i in range(min(len(l), options['top'])):
    (count, user) = l[i]
    print user.ljust(21), ':', count
  print


# TODO: refactor to use find_winners_by_type
def find_winners(maptypes = None, options = {}):
  if maptypes is None:
    maptypes = ALL_MAP_TYPES

  maptypedict = {}
  if type(maptypes) == str:
    maptypedict[maptypes] = True
  else:
    for maptype in maptypes:
      maptypedict[maptype] = True

  mapid = get_todays_mapids()[3]
  winners = {}
  while mapid > -1:
    thismaptype = get_map_type(mapid)
    if thismaptype in maptypedict:
      winner = find_max_display(mapid)
      print 'winner', winner, thismaptype
      winners[winner] = winners.get(winner, 0) + 1

      print 'Leaderboard:', mapid
      print_leaderboard(winners, options)
    mapid -= 1

def find_winners_by_type(options = {}):
  mapid = get_todays_mapids()[3]
  winners = {}
  while mapid > -1:
    print 'mapid', mapid
    maptype = get_map_type(mapid)
    if maptype not in winners:
      winners[maptype] = {}
    winner = find_max_display(mapid)
    winners[maptype][winner] = winners[maptype].get(winner, 0) + 1

    print '--------'
    for maptype in winners:
      print 'Leaderboard for %s:' % maptype
      print_leaderboard(winners[maptype], options)
      print
    print '--------'
    mapid -= 1

# stats on a group of people winning
def group_wins(group):
  group = set([user_id_map[x] for x in group])
  date = datetime.datetime.now()
  num = 0
  den = 0
  while True:
    mapids = get_mapids(date)
    winners = []
    count = 0
    for i in range(4):
      mapid = mapids[i]
      winners.append(find_max_display(mapid))
      userid = find_max_user(mapid)
      if userid in group:
        count += 1
    num += count
    den += 4

    date -= datetime.timedelta(days=1)
    if count == 0:
      print isodate(date), 'winners', winners
      print count, str(num)+'/'+str(den), (num / (den + 0.0))

first_pathery_date = datetime.datetime(2011, 3, 30) # 3/3 was snap's join date, 3/11 starts having regular maps, 3/16-3/29 is broken

def print_user_history(user, options = {}):
  userid = user_id_map[user]
  if 'reverse' not in options:
    options['reverse'] = False
  if 'firstdate' in options:
    date = options['firstdate']
  else:
    if options['reverse']:
      date = datetime.datetime.now()
    else:
      date = first_pathery_date

  on_time_count = 0
  days = 0
  wins = 0
  while True:
    mapids = get_mapids(date)
    on_time = False
    message = ''
    for i in range(0,4):
      mapid = mapids[i]
      score = find_user_score(mapid, userid)
      time = find_user_time(mapid, userid)
      if score is not None:
        if time < 60 * 10:
          on_time = True
        maxscore = find_max_score(mapid)
        maptype = get_map_type(mapid)
        won = False
        if maxscore == score:
          if find_max_user(mapid) == userid:
            won = True
            wins += 1
          verb = 'tied on'
        else:
          verb = 'attempted'
        message += '    ' + ' '.join([user, verb.ljust(9), maptype.ljust(20)])
        if won:
          message += ' and won!'
        message += '\n'

    if on_time:
      message += 'Was on time!  '
      on_time_count += 1
    days += 1

    def str_frac(num, den):
      return "%s/%s = %s%%" % (str(num), str(den), "NaN" if den == 0 else str((0.0 + num)/den))

    message += 'On time %s so far! ' % str_frac(on_time_count, days)
    message += '\n'
    message += 'Won %s so far! ' % str_frac(wins, on_time_count * 4)
    message += '\n'
    print message
    if options['reverse']:
      date -= datetime.timedelta(days=1)
    else:
      date += datetime.timedelta(days=1)

def print_history(options = {}):
  if 'reverse' not in options:
    options['reverse'] = True
  if 'firstdate' in options:
    date = options['firstdate']
  else:
    if options['reverse']:
      date = datetime.datetime.now()
    else:
      date = first_pathery_date
  while True:
    mapids = get_mapids(date)
    print isodate(date)
    for i in range(0,4):
      mapid = mapids[i]
      winner = find_max_display(mapid)
      maptype = get_map_type(mapid)
      message = '    ' + ' '.join([winner, ' won ', maptype.ljust(20)])
      print message
    if options['reverse']:
      date -= datetime.timedelta(days=1)
    else:
      date += datetime.timedelta(days=1)

def get_stats(user, options = {}):
  userid = user_id_map[user]
  if 'reverse' not in options:
    options['reverse'] = False
  if 'firstmap' in options:
    mapid = options['firstmap']
  else:
    if options['reverse']:
      mapid = get_todays_mapids()[3]
    else:
      mapid = 0

  points = 0
  mazes = 0
  moves = 0
  ties = 0
  wins = 0

  while mapid >= 0:
    score = find_user_score(mapid, userid)
    if score is not None:
      points += find_user_points(mapid, userid)
      mazes += 1
      moves += score
      maxscore = find_max_score(mapid)
      if maxscore == score:
        ties += 1
        if find_max_user(mapid) == userid:
          wins += 1
          print ' | '.join([     x.ljust(8) for x in ['Mapid', 'Points','Moves','Mazes','Ties','Wins', 'Win%']])
          print ' | '.join([str(x).ljust(8) for x in [mapid, points, moves,mazes,ties, wins, (wins / (mazes + 0.0))]])
    print ' | '.join([     x.ljust(8) for x in ['Mapid', 'Points','Moves','Mazes','Ties','Wins']])
    print ' | '.join([str(x).ljust(8) for x in [mapid, points, moves,mazes,ties, wins]])
    if options['reverse']:
      mapid -= 1
    else:
      mapid += 1

def get_maptype_history(maptype, options = {}):
  if 'reverse' not in options:
    options['reverse'] = False

  if options['reverse']:
    mapid = get_todays_mapids()[4]
  else:
    mapid = 0
    if maptype == 'Ultra Complex':
      mapid = 2996

  ntop = options['top'] if ('top' in options) else 1

  mazes = 0

  headers = [('#', 5), ('Mapid', 6), ('Moves', 5), ('#Ties', 4), ('Time', 20)]

  firstline = ' | '.join([x.rjust(y) for (x, y) in headers]) + ' | ' \
      + ' | '.join([str(x).rjust(25) for x in range(1, ntop+1)])
  print firstline
  print '=' * len(firstline)
  while mapid >= 0:
    if get_map_type(mapid) == maptype:
      maxscore = find_max_score(mapid)
      top = [find_nth_display(mapid, i) for i in range(1, ntop+1)]
      mazes += 1
      nties = get_num_ties(mapid)
      time = find_time_taken(mapid, maptype)
      print ' | '.join([str(x).rjust(y[1]) for (x, y) in zip([mazes, mapid, maxscore, nties, time], headers)]) + ' | ' \
          + ' | '.join([x.rjust(25) for x in top])
    if options['reverse']:
      mapid -= 1
    else:
      mapid += 1

def get_fastest_ever():
  mapid = get_todays_mapids()[4]
  ntop = 1

  headers = [('Map type', 20), ('Mapid', 6), ('Time', 20), ('Winner', 25)]

  fastest = {}

  while mapid >= 0:
    maptype = get_map_type(mapid)
    if maptype not in ALL_MAP_TYPES:
        mapid -= 1
        continue
    top = find_max_display(mapid)
    time = find_time_taken(mapid, maptype)

    best = fastest.get(maptype)

    if (time is not None) and (best == None or best[1] > time):
        fastest[maptype] = (mapid, time, top)
    mapid -= 1

  firstline = ' | '.join([x.rjust(y) for (x, y) in headers])
  print firstline
  print '=' * len(firstline)
  results = []
  for (maptype, best) in fastest.iteritems():
      results.append([maptype] + list(best))
  results.sort(key=lambda x: x[2])
  for result in results:
      print ' | '.join([str(x).rjust(y[1]) for (x, y) in zip(result, headers)])

def count_uc_ties(users = None, misses_allowed = float("Infinity"), options = {}):
  if 'reverse' not in options:
    options['reverse'] = False

  if options['reverse']:
    mapid = get_todays_mapids()[4]
  else:
    mapid = 2996

  num_ties_map = {}
  mazes = 0

  while mapid >= 0:
    if get_map_type(mapid) == 'Ultra Complex':
      mazes += 1
      nties = get_num_ties(mapid)
      print "-------------------------"
      print "UC Maze #", mazes
      print "# ties", nties
      print "-------------------------"
      for i in range(nties):
        disp = find_nth_display(mapid, i+1)
        if disp not in num_ties_map:
          num_ties_map[disp] = 0
        num_ties_map[disp] += 1

      for disp in num_ties_map:
        print disp.ljust(25), num_ties_map[disp]
    if options['reverse']:
      mapid -= 1
    else:
      mapid += 1

def graph_win_amounts(users = [], options = {}):
  wins_so_far = {}
  for user in users:
      wins_so_far[user_id_map[user]] = 0

  mapid = options.get('first_map', 0)
  last_mapid = get_todays_mapids()[3]

  wins_over_time = [ [] for i in range(len(users)) ]
  mapids = []
  starting = False
  while mapid < last_mapid:
      # if get_map_type(mapid) == 'Simple' or get_map_type(mapid) == 'Normal':
      #     mapid += 1
      #     continue
      winner = find_max_user(mapid)
      if winner in wins_so_far:
          wins_so_far[winner] += 1
          starting = True
      if starting:
          for i, user in enumerate(users):
              wins_over_time[i].append(wins_so_far[user_id_map[user]])
          mapids.append(mapid)
      mapid += 1

  for i, user in enumerate(users):
      plt.plot(mapids, wins_over_time[i], label=user, linewidth=2)
  plt.xlabel('mapid')
  plt.ylabel('wins')
  plt.legend(loc=2)
  plt.show()

def graph_win_times(options = {}):
  # number of days to do moving average over
  if 'ndays' not in options:
    options['ndays'] = 50
  if 'type' not in options:
    options['type'] = 'median' # 'mean'
  if  options['type'] == 'median':
    def average(lst):
      return np.median([x for x in lst if x is not None])
  else:
    def average(lst):
      return np.mean([x for x in lst if x is not None])

  averages = [ [] for i in range(0, 3) ]
  times = [ [None for j in range(options['ndays'])] for i in range(0, 3) ]
  day = 0

  #date = first_pathery_date
  date = datetime.datetime.now() - datetime.timedelta(days=365)
  today = datetime.datetime.now()
  while date < today:

    mapids = get_mapids(date)
    for i in range(0,3):
      t = time_to_seconds(find_fastest_time(mapids[i]))
      times[i][day % options['ndays']] = t
      if day >= options['ndays']-1:
        averages[i].append(average(times[i]))

    day  = day + 1
    date += datetime.timedelta(days=1)


  f, (ax1, ax2, ax3) = plt.subplots(3, 1)
  ax1.plot(averages[0])
  ax1.set_title('Simple')
  ax1.set_ylim(ymin=0)#,ymax=30)
  ax2.plot(averages[1])
  ax2.set_title('Normal')
  ax2.set_ylim(ymin=0)#,ymax=2*60)
  ax3.plot(averages[2])
  ax3.set_title('Complex')
  ax3.set_ylim(ymin=0)#,ymax=8*60)
  plt.show()

def get_normal_complex_diffs(options = {}):
  averages = [ [] for i in range(0, 3) ]
  day = 0

  #date = first_pathery_date
  date = datetime.datetime.now() - datetime.timedelta(days=1000)
  today = datetime.datetime.now()
  best = 0
  while date < today:

    mapids = get_mapids(today)
    normal_s = find_max_score(mapids[1])
    complex_s = find_max_score(mapids[2])
    if (normal_s - complex_s > best) and get_map_type(mapids[2]) == 'Complex':
      print 'diff', normal_s - complex_s
      print 'mapids', today, mapids[1], mapids[2], normal_s, complex_s
      best = normal_s - complex_s
    today -= datetime.timedelta(days=1)

#get_extremal_total_days()
# graph_win_amounts(['blue', 'uuu', 'wu', 'hroll', 'radivel', 'dewax', 'vzl', 'salubrious', 'doth', 'snap', 'splax'], {'first_map': 0})
# graph_win_amounts(['blue', 'uuu', 'wu', 'hroll', 'dewax', 'vzl', 'salubrious', 'doth'], {'first_map': 1500})
# graph_win_amounts(['blue', 'uuu', 'wu', 'hroll', 'dewax', 'vzl', 'salubrious', 'doth', 'zirikki', 'sirknighting', 'jason', 'baz', 'yeuo', 'sid', 'johnnie', 'tricky', 'heaven', 'jimp'], {'first_map': 1500})
#graph_win_amounts(['blue', 'uuu', 'wu', 'hroll', 'salubrious', 'doth', 'zirikki', 'sirknighting', 'yeuo', 'sid'], {'first_map': 6000})
# graph_win_amounts(['blue', 'uuu', 'wu', 'hroll', 'salubrious', 'doth', 'zirikki', 'sirknighting', 'yeuo', 'sid'], {'first_map': 1500} )
#graph_win_times()
#find_missed_maps('wu')
#get_score_distribution('Thirty Too')
#get_rank_distribution(['wu', 'blue', 'dewax', 'vzl', 'uuu', 'sid'], 10)
#find_sweeps()
#find_sweep_stoppers()
#find_win_amounts('george')
#find_win_types('sir')
#find_win_types('yeuo')
#find_win_types('wu')
#find_win_types('uuu')

#find_winners('Ultra Complex')
#find_winners('Teleport Madness')
#find_winners('Unlimited')
#find_winners(['Complex', 'Reverse Order'])

#find_winners_by_type()

#group_wins(['wu', 'blue', 'george',  'uuu'])

#user = 'vzl'
#print_user_history(user, {'reverse': False, 'firstdate': datetime.datetime(2012, 12, 11)})
#print_user_history(user, {'reverse': True})
#print_history()

#get_maptype_history('Ultra Complex', {'reverse': True, 'top': 3})
#get_maptype_history('Thirty', {'reverse': True, 'top': 3})
#get_fastest_ever()
#count_uc_ties()

#get_stats('wu', {'reverse': False, 'firstmap': 3257}) # streak
#get_stats('wu', {'reverse': False, 'firstmap': 2580})
#get_stats('wu', {'reverse': True})

#get_mapcodes_of_type('Ultra Complex')
