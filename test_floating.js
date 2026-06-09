let term = 12;
let amount = 120000000;
let method = 'reducing';

let dynamicRates = [
  {from: 1, to: 6, val: 10, type: 'year'},
  {from: 7, to: 12, val: 12, type: 'year'}
];

const getRateForMonth = (m) => {
  let r = dynamicRates.find(dr => m >= dr.from && m <= dr.to);
  if(!r) r = dynamicRates[dynamicRates.length - 1] || {val: 0, type: 'year'};
  return r.type === 'year' ? r.val / 12 / 100 : r.val / 100;
};

let schedule = [];
let totalInterest = 0;
let remainAmount = amount;
let principalMonth = amount / term;

for(let i = 1; i <= term; i++) {
  let currentRateMonth = getRateForMonth(i);
  
  let interestMonth = 0;
  if(method === 'reducing') {
    interestMonth = remainAmount * currentRateMonth;
  } else {
    interestMonth = amount * currentRateMonth;
  }
  
  let totalPayMonth = principalMonth + interestMonth;
  totalInterest += interestMonth;
  
  schedule.push({
    period: i,
    principal: principalMonth,
    interest: interestMonth,
    total: totalPayMonth,
    remain: remainAmount - principalMonth > 0 ? remainAmount - principalMonth : 0
  });
  
  remainAmount -= principalMonth;
}

console.log("Total Interest:", totalInterest);
console.log(schedule);
