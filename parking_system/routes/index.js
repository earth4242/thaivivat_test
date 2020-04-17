var express = require('express');
var router = express.Router();

const Parking_slot = require('../models/slot');
const Parking_status = require('../models/status');
var format = require('date-format');
var nowdate = format('yyyy-MM-dd', new Date());
var nextdate = new Date();
nextdate.setDate(new Date().getDate()+1);

async function checkstatusdate() {
  let boolres=true,checkstatus = await Parking_status.findOne({ parking_date : nowdate });
  if(checkstatus==null){
    let insertrow = new Parking_status({
      parking_date : nowdate
    });
    await insertrow.save();
  }else{
    if(Number(checkstatus.lotsize)==0) boolres=false;
  }
  return boolres;
}

async function gettime() {
  return format('yyyy-MM-dd hh:mm:ss', new Date());
}

/* GET home page. */
router.get('/setup', async function(req, res, next) {
  if(req.query.type){
    var type = req.query.type;
    if(await checkstatusdate()||type=='createlot'){
      async function createlot() {
        if(Number(req.query.lotsize)){
          let lotsize = Number(req.query.lotsize);
          //var getlist = await Parking_status.find({}).$where('this.slot > 2')
          let getlotsize = await Parking_status.findOne({ parking_date : nowdate });
          if(lotsize>=Number(getlotsize.lastedslot)){
            await Parking_status.findOneAndUpdate({ parking_date : nowdate },{ lotsize : lotsize });
            res.json({ status : "Create Success" });
          }else{
            res.json({ status : "lotsize should more than "+lotsize })
          }
        }else{
          res.json({ status : "wrong params" });
        }
      }
      async function parkslot() {
        if(req.query.platnumber&&req.query.carsize=='small'||req.query.carsize=='medium'||req.query.carsize=='large'){
          let platnumber=req.query.platnumber;
          let chkplatnumber = await Parking_slot.find({ platnumber : platnumber , status : 0 , parking_date : { '$gte': nowdate , '$lt': nextdate } });
          if(!chkplatnumber.length){
            let getlot = await Parking_slot.findOne({ parking_date : { '$gte': nowdate , '$lt': nextdate },status : 0 }).sort({ slot : -1 }),carsize=req.query.carsize;
            var lot=1;
            if(getlot != null) lot = 1+Number(getlot.slot);
            let boollot=true,boolchklotsize=true,chklotempty = await Parking_slot.find({ parking_date : { '$gte': nowdate , '$lt': nextdate },status : 0 }).sort({ slot : 1 });
            for (var i = 0; i < chklotempty.length; i++) {
              if(Number(chklotempty[i].slot)!=(i+1)){
                lot = i+1;
                boolchklotsize = false;
                break;
              }
            }
            if(boolchklotsize){
              let getlotsize = await Parking_status.findOne({ parking_date : nowdate });
              if(Number(getlotsize.lotsize)<=(lot-1)) boollot = false;
            }
            if(boollot){
              let insertrow = new Parking_slot({
                parking_date : nowdate,
                platnumber : platnumber,
                size : carsize,
                slot : lot
              });
              await insertrow.save();

              if(boolchklotsize) await Parking_status.findOneAndUpdate({ parking_date : nowdate },{ lastedslot : lot });

              let getentry = await Parking_status.findOne({ parking_date : nowdate });
              let amount = Number(getentry.entry_amount)+1;
              await Parking_status.findOneAndUpdate({ parking_date : nowdate },{ entry_amount : amount });

              res.json({ status : "Entry Success" });
            }else{
              res.json({ status : "Parking lot is Full now" });
            }
          }else{
            res.json({ status : "Please Exit Before" });
          }
        }else{
          res.json({ status : "wrong params" });
        }
      }
      async function leaveslot() {
        if(req.query.platnumber){
          let platnumber=req.query.platnumber;
          let chkplatnumber = await Parking_slot.find({ platnumber : platnumber , status : 0 , parking_date : { '$gte': nowdate , '$lt': nextdate } });
          if(chkplatnumber.length){
            let thistime = await gettime();
            await Parking_slot.findOneAndUpdate({ platnumber : platnumber , status : 0 },{ status : 1 , exit_time : thistime });
            let getexit = await Parking_status.findOne({ parking_date : nowdate });
            let amount = Number(getexit.exit_amount)+1;

            let getlot = await Parking_slot.findOne({ parking_date : { '$gte': nowdate , '$lt': nextdate },status : 0 }).sort({ slot : -1 });
            var lot=0;
            if(getlot != null) lot = Number(getlot.slot);

            await Parking_status.findOneAndUpdate({ parking_date : nowdate },{ lastedslot : lot , exit_amount : amount });
            res.json({ status : "Leave Success" });
          }else{
            res.json({ status : "Please Entry Before" });
          }
        }else{
          res.json({ status : "wrong params" });
        }
      }
      async function reset() {
        await Parking_slot.deleteMany({ parking_date : { '$gte': nowdate , '$lt': nextdate } })
        await Parking_status.deleteMany({ parking_date : nowdate  })
        res.json({ status : "Reset Success" })
      }
      switch (type) {
        case 'createlot' : await createlot(); break;
        case 'parkslot' : await parkslot(); break;
        case 'leaveslot' : await leaveslot(); break;
        case 'reset' : await reset(); break;
        default: res.json({ status : "wrong params" })
      }
    }else{
      res.json({ status : "Please Create Parking Lot Before" })
    }
  }else{
    res.json({ status : "wrong params" });
  }
});

router.get('/getstatus', async function(req, res, next) {
  if(req.query.type){
    var type = req.query.type;
    if(await checkstatusdate()){
      async function parkinglot() {
        let getstatus = await Parking_status.findOne({ parking_date : nowdate });
        var jsonres = { status : "database fail" };
        let available = Number(getstatus.entry_amount)-Number(getstatus.exit_amount);
        if(getstatus!=null) jsonres = { lotsize : getstatus.lotsize , lasted_slot : getstatus.lastedslot , available : available , entry_amount : getstatus.entry_amount , exit_amount : getstatus.exit_amount };
        res.json(jsonres);
      }
      async function registration() {
        if(req.query.carsize=='all'||req.query.carsize=='small'||req.query.carsize=='medium'||req.query.carsize=='large'){
          let carsize = req.query.carsize;
          var nowentry = [],exited=[],condtion = { parking_date : { '$gte': nowdate , '$lt': nextdate } };
          if(carsize!='all') condtion.size = carsize;
          let getlist = await Parking_slot.find(condtion).sort({ status : 1 , slot : 1 , entry_time : 1 });
          for (var i = 0; i < getlist.length; i++) {
            let entryform = format('yyyy-MM-dd hh:mm:ss', getlist[i].entry_time),exitform=format('yyyy-MM-dd hh:mm:ss', getlist[i].exit_time);
            let entrytime = entryform.split(' ') , exittime = exitform.split(' ');
            if(!Number(getlist[i].status)){
              nowentry.push({ platnumber : getlist[i].platnumber , carsize : getlist[i].size , slotnumber : getlist[i].slot , entry_time : entrytime[1] });
            }else{
              exited.push({ platnumber : getlist[i].platnumber , carsize : getlist[i].size , slotnumber : getlist[i].slot , entry_time : entrytime[1] , exit_time : exittime[1] });
            }
          }
          res.json({ entrylist : nowentry , exitlist : exited });
        }else{
          res.json({ status : "wrong params" });
        }
      }
      async function allocateslot() {
        if(req.query.carsize=='all'||req.query.carsize=='small'||req.query.carsize=='medium'||req.query.carsize=='large'){
          let carsize = req.query.carsize;
          var nowentry = [],condtion = { status : 0 , parking_date : { '$gte': nowdate , '$lt': nextdate } };
          if(carsize!='all') condtion.size = carsize;
          let getlist = await Parking_slot.find(condtion).sort({ slot : 1 , entry_time : 1 });
          for (var i = 0; i < getlist.length; i++) {
            let entryform = format('yyyy-MM-dd hh:mm:ss', getlist[i].entry_time);
            let entrytime = entryform.split(' ')
            nowentry.push({ platnumber : getlist[i].platnumber , carsize : getlist[i].size , slotnumber : getlist[i].slot , entry_time : entrytime[1] });
          }
          res.json({ entrylist : nowentry });
        }else{
          res.json({ status : "wrong params" });
        }
      }
      switch (type) {
        case 'parkinglot' : await parkinglot(); break;
        case 'regist' : await registration(); break;
        case 'allocate' : await allocateslot(); break;
        default: res.json({ status : "wrong params" })
      }
    }else{
      res.json({ status : "Please Create Parking Lot Before" })
    }
  }else{
    res.json({ status : "wrong params" });
  }
});

module.exports = router;
