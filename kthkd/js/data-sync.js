// ═══════════════════════════════════════════════════════════
// IMPORT / EXPORT
// ═══════════════════════════════════════════════════════════
function exportData(){
  var payload={
    appVersion:'1.0',
    exportTime:new Date().toISOString(),
    group:S.group,hasG4:S.hasG4,
    profile:S.profile,
    periods:S.periods,
    data:S.data
  };
  var blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  var fname='SoKeToan_'+S.profile.name.replace(/\s+/g,'_')+'_'+S.curPeriod.replace('/','_')+'_'+new Date().toISOString().slice(0,10)+'.json';
  a.href=url;a.download=fname;a.click();
  URL.revokeObjectURL(url);
  toast('Đã xuất file backup: '+fname);
}

function importData(input){
  var file=input.files[0];
  if(!file)return;
  var reader=new FileReader();
  reader.onload=function(ev){
    try{
      var data=JSON.parse(ev.target.result);
      if(!data.profile||!data.data)throw new Error('File không hợp lệ');
      S.group=data.group||1;S.hasG4=data.hasG4||false;
      S.profile=data.profile;S.periods=data.periods||[data.profile.period];
      S.curPeriod=S.periods[0];S.curBook='dash';S.data=data.data||{};
      S.periods.forEach(initPeriod);
      $('setup').style.display='none';
      $('app').style.display='flex';
      buildAppShell();renderContent();
      toast('Đã khôi phục dữ liệu thành công! ('+file.name+')');
    }catch(e){toast('Lỗi: '+e.message,'err');}
  };
  reader.readAsText(file);
}

function clearLocalData() {
  if(!confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu (bút toán, hồ sơ) và quay lại màn hình thiết lập?')) return;
  localStorage.removeItem('kthkd_data');
  location.reload();
}
