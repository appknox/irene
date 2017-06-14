humanizeCvss = (cvssVector) ->
  metrics = {
    'AV': 'Attack Vector',
    'AC': 'Attack Complexity',
    'PR': 'Privileges Required',
    'UI': 'User Interaction',
    'S': 'Scope',
    'C': 'Confidentiality Impact',
    'I': 'Integrity Impact',
    'A': 'Availability Impact'}

  allowed_values = {
    'AV': {
      'N': 'Network',
      'A': 'Adjacent',
      'L': 'Local',
      'P': 'Physical'},
    'AC': {
      'L': 'Low',
      'H': 'High'},
    'PR': {
      'N': 'None',
      'L': 'Low',
      'H': 'High'},
    'UI': {
      'N': 'Not Required',
      'R': 'Required'},
    'S':  {
      'U': 'Unchanged',
      'C': 'Changed'},
    'C':  {
      'H': 'High',
      'L': 'Low',
      'N': 'None'},
    'I':  {
      'H': 'High',
      'L': 'Low',
      'N': 'None'},
    'A':  {
      'H': 'High',
      'L': 'Low',
      'N': 'None'}}

  splitVector = cvssVector.replace("CVSS:3.0/", "").split "/"
  for splittedVector in splitVector
    sv = splittedValue.split ":"
    key = sv[0]
    value = sv[1]
    metrics[key] + ":" + allowed_values[key][value]
`export default humanizeCvss`
