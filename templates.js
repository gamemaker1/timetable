const escape = (t) => {
  const d = document.createElement("div")
  d.textContent = t
  return d.innerHTML
}

export const Templates = {
  filters: (current) =>
    ["all", "h1", "h2"]
      .map(
        (f) => `
        <button data-filter="${f}" class="text-[11px] tracking-widest uppercase transition ${current === f ? "text-black font-bold" : "text-slate-600 hover:text-black"}">
            ${f === "all" ? "ALL" : f + " ONLY"}
        </button>
    `,
      )
      .join(""),

  friend: (friend, isOpen) => `
        <div class="relative friend-container pt-4 border-t border-slate-100" data-id="${friend.id}">
            <div class="flex items-center justify-between group mb-2">
                <div class="flex items-center gap-3">
                    <div class="w-3 h-3 rounded-full shrink-0" style="background-color: ${friend.color}"></div>
                    <span class="text-[14px] font-medium text-slate-900 cursor-pointer action-search">${escape(friend.name)}</span>
                </div>
                <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                    <button class="action-edit text-[9px] font-bold text-slate-400 hover:text-blue-600">EDIT</button>
                    <button class="action-delete text-[9px] font-bold text-slate-400 hover:text-red-600">DEL</button>
                </div>
            </div>
            ${
              isOpen
                ? `
                <div class="absolute top-12 left-0 w-full bg-white border shadow-2xl z-50 rounded-lg overflow-hidden">
                    <input type="text" class="search-input w-full p-4 text-[12px] focus:outline-none border-b" placeholder="Search course...">
                    <div class="search-results max-h-[200px] overflow-y-auto no-scrollbar"></div>
                </div>`
                : ""
            }
            <div class="mt-4 space-y-1.5">
                ${friend.courses
                  .map(
                    (c) => `
                    <div class="group flex justify-between items-center text-[11px] text-slate-700">
                        <span class="truncate pr-2">${escape(c)}</span>
                        <button class="action-remove opacity-0 group-hover:opacity-100 text-red-600" data-name="${escape(c)}">✕</button>
                    </div>`,
                  )
                  .join("")}
            </div>
        </div>
    `,

  gridRow: (startTime, endTime, cells) => `
        <div class="timetable-grid border-b border-slate-100 min-h-[95px]">
            <div class="py-6 mono text-[10px] text-slate-400 font-medium text-center border-r border-slate-50 flex flex-col justify-center gap-1">
                <div class="text-slate-600 text-[11px]">${startTime}</div>
                <div class="opacity-40">—</div>
                <div>${endTime}</div>
            </div>
            ${cells}
        </div>
    `,

  gridCell: (entries) => `
        <div class="p-3 border-l border-slate-100 space-y-3">
            ${entries
              .map(
                (e) => `
                <div class="flex items-center gap-2.5">
                    <div class="flex -space-x-1.5 shrink-0">
                        ${e.people
                          .map(
                            (p, i) => `
                            <div class="w-3.5 h-3.5 rounded-full ring-2 ring-white" 
                                 style="background-color: ${p.color}; z-index: ${10 - i}" 
                                 title="${escape(p.name)}"></div>
                        `,
                          )
                          .join("")}
                    </div>
                    <span class="text-[11px] leading-tight truncate text-slate-800 font-medium">
                        ${escape(e.course.name)}
                        ${e.course.half ? `<span class="mono text-slate-400 text-[9px] ml-1 uppercase">${e.course.half}</span>` : ""}
                    </span>
                </div>`,
              )
              .join("")}
        </div>
    `,
}
