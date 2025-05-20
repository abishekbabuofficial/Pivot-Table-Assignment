import { useEffect, useState } from 'react'
import './App.css'
import FileUploader from './components/FileUploader'
import PivotTable from './components/PivotTable'
// import SelectorPane from './components/SelectorPane'
import SelectorPane from './components/SelectorPane'
import { set } from 'date-fns'


function App() {
  //setting the states
  const [data, setData] = useState([]);
  const [rowFields, setRowFields] = useState([]);
  const [columnFields, setColumnFields] = useState([]);
  const [valueFields, setValueFields] = useState([]);
  const [aggregationType, setAggregationType] = useState({});
  
  // to refresh selection when new file is uploaded
  useEffect(() => {
    setRowFields([]);
    setColumnFields([]);
    setValueFields([]);
    setAggregationType({});
  },[data])

  
  return (
    <div className='flex flex-col items-center'>
      <FileUploader dataParsed = {setData}/>
      
      <div className='flex p-2'>
        {data.length>0 &&<> 
        <div className='w-[750px]'>
          <PivotTable 
        data = {data}
        rowFields={rowFields}
        columnFields={columnFields}
        valueFields={valueFields}
        aggregationType={aggregationType}/>
        </div>
        

      <SelectorPane 
      uploadedData={data}
      rowFields={rowFields}
      columnFields={columnFields}
      valueFields={valueFields}
      aggregationType={aggregationType}
      setRowFields = {setRowFields}
      setColumnFields = {setColumnFields}
      setValueFields = {setValueFields}
      setAggregationType = {setAggregationType}
      />
      </>}
    </div>
    </div>
  )
}

export default App
