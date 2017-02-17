// function validateEmail(email) {
//   var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//   return re.test(email);
// }

// console.log('returns:', validateEmail('hey@some.com'));
// console.log('returns:', validateEmail('h@some.co'));
// console.log('returns:', validateEmail('heysome.com'));
// console.log('returns:', validateEmail('hey@some.'));

var bcrypt = require('bcrypt');

function pass(rounds) {
  var salt = bcrypt.genSaltSync(rounds);
  let then = Date.now();
  let hash = bcrypt.hashSync('password', salt);
  console.log(hash);
  return `${(Date.now() - then) / 1000} secs`;
}

for (let i = 8; i < 14; i++){
  console.log(`${i} rounds: ${pass(i)}`);
}




// var match2 = re.test(str2);

// console.log(match);
// console.log(match2);