// ===================== app.js =====================
const templates = {
  "Strength": ["Limit bouldering","Pull-ups","Core"],
  "Power Endurance": ["4x4s","Circuits","Volume"],
  "Finger Strength": ["Hangboard","Finger trainer","Technique"]
};

let sessions = JSON.parse(localStorage.getItem('sessions')) || [];
let currentTasks = [];
let chart;

const typeEl = document.getElementById('type');
const tasksEl = document.getElementById('tasks');
const hangEl = document.getElementById('hang');
const gradeEl = document.getElementById('grade');
const pullupsEl = document.getElementById('pullups');
const painEl = document.getElementById('pain');
const noteEl = document.getElementById('note');
const dateEl = document.getElementById('date');

Object.keys(templates).forEach(t => {
  const opt = document.createElement('option');
  opt.value = t;
  opt.textContent = t;
  typeEl.appendChild(opt);
});

typeEl.addEventListener('change', loadTemplate);
document.getElementById('addBtn').addEventListener('click', addSession);

function loadTemplate(){
  const type = typeEl.value;
  currentTasks = templates[type].map(t => ({ name:t, done:false }));
  renderTasks();
}

function renderTasks(){
  tasksEl.innerHTML='';
  currentTasks.forEach((t,i)=>{
    const div = document.createElement('div');
    div.className = 'task';
    div.innerHTML = `<input type='checkbox' /> ${t.name}`;
    div.querySelector('input').addEventListener('change', () => { currentTasks[i].done = !currentTasks[i].done; });
    tasksEl.appendChild(div);
  });
}

function save(){ localStorage.setItem('sessions', JSON.stringify(sessions)); }

function addSession(){
  const sessionDate = dateEl.value ? new Date(dateEl.value).toISOString() : new Date().toISOString();
  const s = {
    id: Date.now(),
    date: sessionDate,
    type: typeEl.value,
    hang: +hangEl.value || 0,
    grade: gradeEl.value,
    pullups: pullupsEl.value,
    pain: +painEl.value || 0,
    note: noteEl.value,
    tasks: JSON.parse(JSON.stringify(currentTasks))
  };

  sessions.unshift(s);
  save(); render(); loadTemplate();

  noteEl.value=''; hangEl.value=''; gradeEl.value=''; pullupsEl.value=''; painEl.value=''; dateEl.value='';
}

function renderWeek(){
  const el=document.getElementById('week'); el.innerHTML='';
  sessions.slice(0,3).forEach(s=>{ el.innerHTML += `<div class='card'>${s.type}<br>${new Date(s.date).toLocaleDateString()}</div>`; });
}

function gradeToNumber(grade){
  const map={"6a":1,"6a+":2,"6b":3,"6b+":4,"6c":5,"6c+":6,"7a":7,"7a+":8,"7b":9,"7b+":10,"7c":11,"7c+":12};
  return map[grade?.toLowerCase()]||null;
}

function renderChart(){
  const ctx=document.getElementById('chart');
  const data=sessions.slice().reverse();
  const labels = data.map(s=>s.grade || '');
  const hangData = data.map(s=>s.hang);
  const gradeData = data.map(s=>gradeToNumber(s.grade));

  if(chart) chart.destroy();

  chart = new Chart(ctx,{
    type:'line',
    data:{
      labels,
      datasets:[
        { label:'Hang Weight (kg)', data: hangData, borderColor:'blue', yAxisID:'y', tension:0.2 },
        { label:'Grade', data: gradeData, borderColor:'red', yAxisID:'y1', tension:0.2 }
      ]
    },
    options:{
      scales:{
        y:{ type:'linear', position:'left', beginAtZero:true, title:{ display:true, text:'Hang Weight (kg)' } },
        y1:{ type:'linear', position:'right', beginAtZero:true, title:{ display:true, text:'Grade Level' }, grid:{ drawOnChartArea:false }, ticks:{ callback: function(value){ const reverseMap={1:"6a",2:"6a+",3:"6b",4:"6b+",5:"6c",6:"6c+",7:"7a",8:"7a+",9:"7b",10:"7b+",11:"7c",12:"7c+"}; return reverseMap[value] || ''; } } }
      }
    }
  });
}

function render(){
  renderWeek(); renderChart();
  const container=document.getElementById('sessions'); container.innerHTML='';

  sessions.forEach(s=>{
    const taskLabels = s.tasks.filter(t=>t.done).map(t=>`✅ ${t.name}`).join('<br>');
    container.innerHTML += `<div class='card'><b>${s.type}</b> ${new Date(s.date).toLocaleDateString()}<br>
Hang:${s.hang} | Grade:${s.grade}<br>
${taskLabels ? taskLabels + '<br>' : ''}
${s.note}</div>`;
  });
}

loadTemplate(); render();
