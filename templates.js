const escape = (t) => {
  const d = document.createElement('div')
  d.textContent = t
  return d.innerHTML
}

export const Templates = {
  filters: (current) =>
    ['all', 'h1', 'h2']
      .map(
        (f) => `
    <button data-filter="${f}" class="text-[11px] tracking-widest uppercase transition ${current === f ? 'text-black dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'}">
      ${f === 'all' ? 'ALL' : f + ' ONLY'}
    </button>
  `,
      )
      .join(''),

  daysHeader: (days) =>
    '<div></div>' +
    days
      .map(
        (d) =>
          `<div class="text-center text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">${d}</div>`,
      )
      .join(''),

  searchResults: (matches) =>
    matches
      .map(
        (c) =>
          `<div class="search-result p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-b border-slate-100 dark:border-slate-800 text-[11px] flex justify-between" data-name="${c.name}">
            <div class="flex gap-2">
               <span>${c.name}</span>
               ${c.classroom ? `<span class="text-slate-400 dark:text-slate-500">[${escape(c.classroom)}]</span>` : ''}
            </div>
            <span class="mono text-slate-400 dark:text-slate-500">${c.half || ''}</span>
          </div>`,
      )
      .join(''),

  friend: (friend, isOpen, courses) => `
    <div class="relative friend-container pt-4 border-t border-slate-100 dark:border-slate-800 transition-opacity ${friend.hidden ? 'opacity-50 grayscale' : 'opacity-100'}" data-id="${friend.id}">
      <div class="flex items-center justify-between group mb-2">
        <div class="flex items-center gap-3">
          <div class="friend-color w-3 h-3 rounded-full shrink-0 cursor-pointer hover:scale-110 transition-transform ${friend.hidden ? 'ring-2 ring-slate-300 dark:ring-slate-600 bg-transparent' : ''}"
               style="background-color: ${friend.hidden ? 'transparent' : friend.color}" title="Toggle Visibility"></div>
          <span class="friend-name text-[14px] font-medium text-slate-900 dark:text-slate-100 cursor-pointer hover:underline underline-offset-4 decoration-slate-300 dark:decoration-slate-700">${escape(friend.name)}</span>
        </div>
        <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button class="action-add text-[9px] leading-none font-bold text-slate-400 hover:text-blue-600 px-1" title="Add Course">ADD</button>
          <button class="action-delete text-[9px] font-bold text-slate-400 hover:text-red-600">DEL</button>
        </div>
      </div>
      ${
        isOpen
          ? `
        <div class="absolute top-12 left-0 w-full bg-white dark:bg-black border border-slate-200 dark:border-slate-700 shadow-2xl z-50 rounded-lg overflow-hidden">
          <input type="text" class="search-input w-full p-4 text-[12px] bg-transparent dark:text-white focus:outline-none border-b border-slate-100 dark:border-slate-800" placeholder="Search course...">
          <div class="search-results max-h-[200px] overflow-y-auto no-scrollbar"></div>
        </div>`
          : ''
      }
      <div class="mt-4 space-y-1.5">
        ${courses
          .map(
            (c) => `
          <div class="group flex justify-between items-baseline text-[11px] text-slate-700 dark:text-slate-400">
            <div class="flex justify-between w-full min-w-0 pr-2">
              <span class="truncate mr-2">
                ${escape(c.name)}
                ${c.classroom ? `<span class="ml-1 text-[10px] text-slate-400 dark:text-slate-600">${escape(c.classroom)}</span>` : ''}
              </span>
              ${c.half ? `<span class="mono text-slate-400 dark:text-slate-500 text-[9px] uppercase shrink-0">${c.half}</span>` : ''}
            </div>
            <button class="action-remove opacity-0 group-hover:opacity-100 text-red-600" data-name="${escape(c.name)}">✕</button>
          </div>`,
          )
          .join('')}
      </div>
    </div>
  `,

  gridRow: (startTime, endTime, cells) => `
    <div class="timetable-grid border-b border-slate-100 dark:border-slate-800 min-h-[95px]">
      <div class="py-6 mono text-[10px] text-slate-400 dark:text-slate-500 font-medium text-center border-r border-slate-50 dark:border-slate-900 flex flex-col justify-center gap-1">
        <div class="text-slate-600 dark:text-slate-300 text-[11px]">${startTime}</div>
        <div class="opacity-40">—</div>
        <div>${endTime}</div>
      </div>
      ${cells}
    </div>
  `,

  gridCell: (entries) => `
    <div class="p-3 border-l border-slate-100 dark:border-slate-900 space-y-3">
      ${entries
        .map(
          (e) => `
        <div class="flex items-center gap-2.5" title="${e.course.classroom ? 'Room ' + escape(e.course.classroom) : ''}">
          <div class="flex -space-x-1.5 shrink-0">
            ${e.people
              .map(
                (p, i) => `
              <div class="w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-black"
                   style="background-color: ${p.color}; z-index: ${10 - i}"
                   title="${escape(p.name)}"></div>
            `,
              )
              .join('')}
          </div>
          <div class="flex-1 flex justify-between items-baseline min-w-0 overflow-hidden">
            <span class="text-[11px] leading-tight truncate text-slate-800 dark:text-slate-200 font-medium mr-2">
              ${escape(e.course.name)}
            </span>
            ${e.course.half ? `<span class="mono text-slate-400 dark:text-slate-500 text-[9px] uppercase shrink-0">${e.course.half}</span>` : ''}
          </div>
        </div>`,
        )
        .join('')}
    </div>
  `,
}
