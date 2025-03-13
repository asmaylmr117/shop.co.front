import ImgSlider from './ImgSlider'

export default function HomeSliders({text,type,del='no',id}) {
  return (
    <div className=' pt-10'>
  <h1 className='bolded text-center text-lg sm:text-xl md:text-3xl whitespace-nowrap'>
  {text}
</h1>


      <ImgSlider type={type} del={del} id={id}/>
    </div>
  )
}
