import { useMemo, useState } from 'react'
import rawRecords from './data/records.json'
import rawChanges from './data/changes.json'
import type { ChangeRecord, Filters, TuitionRecord } from './types'

const records = rawRecords as TuitionRecord[]
const changes = rawChanges as ChangeRecord[]

const DEFAULT_FILTERS: Filters = {
  year: 2026,
  schoolType: 'ALL',
  establishment: 'ALL',
  region: 'ALL',
  tuitionBand: 'ALL',
  query: '',
  includeZero: false,
  sort: 'DESC',
  limit: 50,
}

const BAND_ORDER = [
  '300만원 미만', '300~500만원', '500~700만원',
  '700~900만원', '900만원 이상', '0원 공시',
]

const COLORS = ['#70ad47','#5b9bd5','#ffc000','#ed7d31','#c00000','#a5a5a5']

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : NaN
}
function median(values: number[]) {
  if (!values.length) return NaN
  const sorted = [...values].sort((a,b) => a-b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid-1] + sorted[mid]) / 2
}
function won(value: number) {
  return Number.isFinite(value) ? `${Math.round(value).toLocaleString('ko-KR')}원` : '-'
}
function million(value: number) {
  return Number.isFinite(value) ? `${(value/1_000_000).toFixed(2)}백만원` : '-'
}
function unique(key: 'schoolType'|'establishment'|'region') {
  return [...new Set(records.map(item => item[key]))].sort((a,b) => a.localeCompare(b,'ko'))
}

export default function App() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)

  const filtered = useMemo(() => {
    const query = filters.query.trim().toLowerCase()
    const rows = records.filter(item =>
      (filters.year === 'ALL' || item.year === filters.year) &&
      (filters.schoolType === 'ALL' || item.schoolType === filters.schoolType) &&
      (filters.establishment === 'ALL' || item.establishment === filters.establishment) &&
      (filters.region === 'ALL' || item.region === filters.region) &&
      (filters.tuitionBand === 'ALL' || item.tuitionBand === filters.tuitionBand) &&
      (!query || item.schoolName.toLowerCase().includes(query)) &&
      (filters.includeZero || item.tuition > 0)
    )
    return [...rows].sort((a,b) => {
      if (filters.sort === 'ASC') return a.tuition-b.tuition
      if (filters.sort === 'NAME') return a.schoolName.localeCompare(b.schoolName,'ko')
      return b.tuition-a.tuition
    })
  }, [filters])

  const valid = filtered.filter(item => item.tuition > 0)
  const values = valid.map(item => item.tuition)
  const minimum = valid.length ? valid.reduce((a,b) => a.tuition < b.tuition ? a : b) : undefined
  const maximum = valid.length ? valid.reduce((a,b) => a.tuition > b.tuition ? a : b) : undefined

  const filteredChanges = changes.filter(item =>
    (filters.schoolType === 'ALL' || item.schoolType === filters.schoolType) &&
    (filters.establishment === 'ALL' || item.establishment === filters.establishment) &&
    (filters.region === 'ALL' || item.region === filters.region) &&
    (!filters.query || item.schoolName.toLowerCase().includes(filters.query.toLowerCase()))
  )
  const changeRate = filteredChanges.length
    ? (average(filteredChanges.map(item => item.tuition2026)) /
       average(filteredChanges.map(item => item.tuition2025)) - 1) * 100
    : NaN

  const groups = (key: 'schoolType'|'establishment'|'region') => {
    const map = new Map<string, number[]>()
    valid.forEach(item => {
      const list = map.get(item[key]) ?? []
      list.push(item.tuition)
      map.set(item[key], list)
    })
    return [...map.entries()].map(([label, nums]) => ({
      label, value: average(nums), count: nums.length,
    }))
  }

  const majorItems = [
    ['인문사회','humanities'],['자연과학','naturalScience'],['예체능','artsSports'],
    ['공학','engineering'],['의학','medicine'],
  ].map(([label,key]) => ({
    label,
    value: average(filtered.map(item => item[key as keyof TuitionRecord] as number).filter(v => v > 0)),
    count: filtered.filter(item => (item[key as keyof TuitionRecord] as number) > 0).length,
  }))

  const bandItems = BAND_ORDER.map((label, index) => ({
    label, value: filtered.filter(item => item.tuitionBand === label).length,
    count: filtered.filter(item => item.tuitionBand === label).length,
    color: COLORS[index],
  }))

  const trend = [2025,2026].map(year => {
    const nums = records.filter(item =>
      item.year === year &&
      item.tuition > 0 &&
      (filters.schoolType === 'ALL' || item.schoolType === filters.schoolType) &&
      (filters.establishment === 'ALL' || item.establishment === filters.establishment) &&
      (filters.region === 'ALL' || item.region === filters.region)
    ).map(item => item.tuition)
    return { year, mean: average(nums), median: median(nums) }
  })

  const changeTop = [...filteredChanges]
    .sort((a,b) => b.changeRate-a.changeRate)
    .filter((_,i,array) => i < 6 || i >= array.length-6)
    .sort((a,b) => a.changeRate-b.changeRate)

  return (
    <>
      <header>
        <h1>🎓 2025–2026 대학 등록금 선택 대시보드</h1>
        <p>학생·학부모를 위한 학교유형·지역·계열별 등록금 비교</p>
      </header>

      <main>
        <div className="notice">
          <strong>⚠️ 분석 범위</strong>
          제공 자료에는 전문대학(2·3년제 등)이 포함되어 있지 않습니다.
          등록금은 기관·캠퍼스 단순평균이며 장학금과 생활비는 반영하지 않습니다.
        </div>

        <section className="filters">
          <Select label="기준연도" value={String(filters.year)}
            onChange={value => setFilters({...filters,year:value==='ALL'?'ALL':Number(value) as 2025|2026})}
            options={[['ALL','전체 연도'],['2025','2025년'],['2026','2026년']]} />
          <Select label="학교유형" value={filters.schoolType}
            onChange={value => setFilters({...filters,schoolType:value})}
            options={[['ALL','전체 학교유형'],...unique('schoolType').map(v=>[v,v])]} />
          <Select label="설립구분" value={filters.establishment}
            onChange={value => setFilters({...filters,establishment:value})}
            options={[['ALL','전체 설립구분'],...unique('establishment').map(v=>[v,v])]} />
          <Select label="지역" value={filters.region}
            onChange={value => setFilters({...filters,region:value})}
            options={[['ALL','전체 지역'],...unique('region').map(v=>[v,v])]} />
          <Select label="등록금 구간" value={filters.tuitionBand}
            onChange={value => setFilters({...filters,tuitionBand:value})}
            options={[['ALL','전체 구간'],...BAND_ORDER.map(v=>[v,v])]} />
          <label><span>학교명 검색</span><input value={filters.query}
            onChange={e=>setFilters({...filters,query:e.target.value})} placeholder="예: 서울, 사이버" /></label>
          <Select label="정렬" value={filters.sort}
            onChange={value=>setFilters({...filters,sort:value as Filters['sort']})}
            options={[['DESC','등록금 높은 순'],['ASC','등록금 낮은 순'],['NAME','학교명 순']]} />
          <Select label="0원 공시" value={filters.includeZero?'Y':'N'}
            onChange={value=>setFilters({...filters,includeZero:value==='Y'})}
            options={[['N','제외'],['Y','포함']]} />
          <Select label="표시 개수" value={String(filters.limit)}
            onChange={value=>setFilters({...filters,limit:Number(value)})}
            options={['20','50','100','300'].map(v=>[v,`${v}개`])} />
          <button onClick={()=>setFilters(DEFAULT_FILTERS)}>필터 초기화</button>
        </section>

        <section className="kpis">
          <Kpi label="기관·캠퍼스 수" value={`${filtered.length.toLocaleString()}개`} sub="현재 필터" />
          <Kpi label="평균 등록금" value={million(average(values))} sub="기관 단순평균" />
          <Kpi label="중앙값" value={million(median(values))} sub="극단값 영향 완화" />
          <Kpi label="최저 등록금" value={minimum?million(minimum.tuition):'-'} sub={minimum?.schoolName??'-'} />
          <Kpi label="최고 등록금" value={maximum?million(maximum.tuition):'-'} sub={maximum?.schoolName??'-'} />
          <Kpi label="동일기관 증감률" value={Number.isFinite(changeRate)?`${changeRate>=0?'+':''}${changeRate.toFixed(2)}%`:'-'} sub="2025→2026" />
        </section>

        <section className="grid two">
          <Card title="연도별 평균·중앙값">
            <div className="trend">
              {trend.map(item=><div key={item.year}>
                <strong>{item.year}</strong>
                <span>평균 {million(item.mean)}</span>
                <span>중앙값 {million(item.median)}</span>
              </div>)}
            </div>
          </Card>
          <Card title="학교유형별 평균">
            <Bars items={groups('schoolType')} />
          </Card>
        </section>

        <section className="grid three">
          <Card title="설립구분별 평균"><Bars items={groups('establishment')} color="#ed7d31" /></Card>
          <Card title="등록금 구간"><Columns items={bandItems} /></Card>
          <Card title="계열별 평균"><Bars items={majorItems} color="#2f5597" /></Card>
        </section>

        <section className="grid two">
          <Card title="지역별 평균"><Bars items={groups('region')} color="#70ad47" /></Card>
          <Card title="학교별 증감률">
            <div className="changes">
              {changeTop.map(item=><div key={`${item.schoolName}-${item.schoolType}`}>
                <span title={item.schoolName}>{item.schoolName}</span>
                <b className={item.changeRate>=0?'up':'down'}>{item.changeRate>=0?'+':''}{item.changeRate.toFixed(2)}%</b>
              </div>)}
            </div>
          </Card>
        </section>

        <section className="table-card">
          <div className="table-title"><h2>학교별 상세 목록</h2><span>{filtered.length}개 중 {Math.min(filters.limit,filtered.length)}개 표시</span></div>
          <div className="table-wrap">
            <table><thead><tr>
              <th>연도</th><th>학교</th><th>학교유형</th><th>설립</th><th>지역</th>
              <th>등록금</th><th>인문사회</th><th>자연과학</th><th>예체능</th><th>공학</th><th>의학</th><th>구간</th>
            </tr></thead><tbody>
              {filtered.slice(0,filters.limit).map(item=><tr key={item.id}>
                <td>{item.year}</td><td>{item.schoolName}</td><td>{item.schoolType}</td>
                <td>{item.establishment}</td><td>{item.region}</td>
                <td className="num"><b>{won(item.tuition)}</b></td>
                {[item.humanities,item.naturalScience,item.artsSports,item.engineering,item.medicine]
                  .map((v,i)=><td className="num" key={i}>{v>0?won(v):'-'}</td>)}
                <td>{item.tuitionBand}</td>
              </tr>)}
            </tbody></table>
          </div>
        </section>
      </main>
      <footer>대학알리미 2025·2026 등록금 자료 기반 · 등록금만으로 대학의 교육 품질을 판단할 수 없습니다.</footer>
    </>
  )
}

function Select({label,value,onChange,options}:{label:string,value:string,onChange:(v:string)=>void,options:string[][]}) {
  return <label><span>{label}</span><select value={value} onChange={e=>onChange(e.target.value)}>
    {options.map(([v,t])=><option key={v} value={v}>{t}</option>)}
  </select></label>
}
function Kpi({label,value,sub}:{label:string,value:string,sub:string}) {
  return <article><span>{label}</span><strong>{value}</strong><small title={sub}>{sub}</small></article>
}
function Card({title,children}:{title:string,children:React.ReactNode}) {
  return <article className="card"><h2>{title}</h2><div className="card-body">{children}</div></article>
}
function Bars({items,color='#5b9bd5'}:{items:{label:string,value:number,count:number}[],color?:string}) {
  if(!items.length)return <p className="empty">데이터 없음</p>
  const sorted=[...items].sort((a,b)=>a.value-b.value)
  const max=Math.max(...sorted.map(v=>v.value),1)
  return <div className="bars">{sorted.map(item=><div key={item.label}>
    <span title={item.label}>{item.label}</span>
    <i><em style={{width:`${item.value/max*100}%`,background:color}} /></i>
    <b>{(item.value/1_000_000).toFixed(2)} <small>({item.count})</small></b>
  </div>)}</div>
}
function Columns({items}:{items:{label:string,value:number,count:number,color:string}[]}) {
  const max=Math.max(...items.map(v=>v.value),1)
  return <div className="columns">{items.map(item=><div key={item.label}>
    <b>{item.value}</b><i><em style={{height:`${item.value/max*100}%`,background:item.color}} /></i><span>{item.label}</span>
  </div>)}</div>
}
