import { STORAGE, COLORS, DAYS } from "./constants.js"
import { Templates } from "./templates.js"

class TimetableApp {
  constructor() {
    this.courses = []
    this.timeSlots = []
    this.friends = []
    this.currentFilter = "all"
    this.activeSearchId = null
  }

  async init() {
    await this.loadData()
    this.setupEvents()
    this.render()
  }

  async loadData() {
    try {
      const res = await fetch("courses.json")
      const data = await res.json()
      this.timeSlots = data.slots || []
      this.courses = data.courses.map((c) => ({
        ...c,
        half: c.half === 1 ? "H1" : c.half === 2 ? "H2" : null,
        slotIds: this.getOverlap(c.starts, c.ends),
      }))
    } catch (e) {
      console.error("Data load error")
    }

    const saved = JSON.parse(localStorage.getItem(STORAGE))
    this.friends = saved?.friends || [
      { id: 1, name: "You", courses: [], color: COLORS[0] },
    ]
  }

  getOverlap(start, end) {
    const parse = (s) => {
      const c = String(s).replace(/[^0-9]/g, "")
      return Math.floor(parseInt(c) / 100) * 60 + (parseInt(c) % 100)
    }
    const s = parse(start),
      e = parse(end)
    return this.timeSlots
      .filter((sl) => s < parse(sl.ends) && e > parse(sl.starts))
      .map((sl) => sl.id)
  }

  save() {
    localStorage.setItem(STORAGE, JSON.stringify({ friends: this.friends }))
  }

  setupEvents() {
    document.addEventListener("click", () => {
      if (this.activeSearchId) {
        this.activeSearchId = null
        this.render()
      }
    })

    document.getElementById("filters").onclick = (e) => {
      if (e.target.dataset.filter) {
        this.currentFilter = e.target.dataset.filter
        this.render()
      }
    }

    const list = document.getElementById("friendsList")
    list.onclick = (e) => {
      e.stopPropagation()
      const id = parseInt(e.target.closest(".friend-container")?.dataset.id)
      if (!id) return

      if (e.target.closest(".action-search")) {
        this.activeSearchId = id
        this.render()
      }
      if (e.target.closest(".action-edit")) this.editFriend(id)
      if (e.target.closest(".action-delete")) this.deleteFriend(id)
      if (e.target.closest(".action-remove"))
        this.toggleCourse(id, e.target.dataset.name)
      if (e.target.closest(".search-result"))
        this.toggleCourse(id, e.target.closest(".search-result").dataset.name)
    }

    list.oninput = (e) => {
      if (e.target.classList.contains("search-input")) this.search(e.target)
    }

    document.getElementById("addFriendBtn").onclick = () => this.addFriend()
    document.getElementById("exportBtn").onclick = () => this.export()
    document.getElementById("pdfBtn").onclick = () => window.print()
    document.getElementById("importBtn").onclick = () =>
      document.getElementById("importFile").click()
    document.getElementById("importFile").onchange = (e) => this.import(e)
  }

  search(input) {
    const query = input.value.toLowerCase()
    const results = input.nextElementSibling
    if (!query) return (results.innerHTML = "")
    const matches = this.courses
      .filter((c) => c.name.toLowerCase().includes(query))
      .slice(0, 10)
    results.innerHTML = matches
      .map(
        (c) =>
          `<div class="search-result p-3 hover:bg-slate-50 cursor-pointer border-b text-[11px] flex justify-between" data-name="${c.name}"><span>${c.name}</span><span class="mono text-slate-400">${c.half || ""}</span></div>`,
      )
      .join("")
  }

  toggleCourse(id, name) {
    const f = this.friends.find((f) => f.id === id)
    const idx = f.courses.indexOf(name)
    idx > -1 ? f.courses.splice(idx, 1) : f.courses.push(name)
    this.activeSearchId = null
    this.save()
    this.render()
  }

  editFriend(id) {
    const f = this.friends.find((f) => f.id === id)
    const n = prompt("Name:", f.name)
    if (n) {
      f.name = n
      this.save()
      this.render()
    }
  }

  deleteFriend(id) {
    if (confirm("Delete?")) {
      this.friends = this.friends.filter((f) => f.id !== id)
      this.save()
      this.render()
    }
  }

  addFriend() {
    const n = prompt("Friend Name:")
    if (n) {
      this.friends.push({
        id: Date.now(),
        name: n,
        courses: [],
        color: COLORS[this.friends.length % COLORS.length],
      })
      this.save()
      this.render()
    }
  }

  render() {
    const fmt = (t) => t.slice(0, 2) + ":" + t.slice(2)
    document.getElementById("filters").innerHTML = Templates.filters(
      this.currentFilter,
    )
    document.getElementById("friendsList").innerHTML = this.friends
      .map((f) => Templates.friend(f, this.activeSearchId === f.id))
      .join("")
    document.getElementById("daysHeader").innerHTML =
      "<div></div>" +
      DAYS.map(
        (d) =>
          `<div class="text-center text-[10px] uppercase tracking-widest text-slate-500 font-semibold">${d}</div>`,
      ).join("")

    document.getElementById("timetableBody").innerHTML = this.timeSlots
      .map((slot) => {
        const cells = DAYS.map((dayName) => {
          const map = new Map()
          this.friends.forEach((f) => {
            f.courses.forEach((cn) => {
              const c = this.courses.find((x) => x.name === cn)
              if (
                !c ||
                !c.days.includes(dayName) ||
                !c.slotIds.includes(slot.id)
              )
                return
              if (
                this.currentFilter !== "all" &&
                c.half &&
                c.half.toLowerCase() !== this.currentFilter
              )
                return
              if (!map.has(cn)) map.set(cn, { course: c, people: [] })
              map.get(cn).people.push(f)
            })
          })
          return Templates.gridCell(Array.from(map.values()))
        }).join("")
        return Templates.gridRow(fmt(slot.starts), fmt(slot.ends), cells)
      })
      .join("")

    if (this.activeSearchId) document.querySelector(".search-input")?.focus()
  }

  export() {
    const blob = new Blob(
      [
        JSON.stringify({
          friends: this.friends,
          exported: new Date().toISOString(),
        }),
      ],
      { type: "application/json" },
    )
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `timetable.json`
    a.click()
  }

  async import(e) {
    const file = e.target.files[0]
    if (!file) return
    const data = JSON.parse(await file.text())
    if (data.friends) {
      this.friends = data.friends
      this.save()
      this.render()
    }
  }
}

const app = new TimetableApp()
app.init()
