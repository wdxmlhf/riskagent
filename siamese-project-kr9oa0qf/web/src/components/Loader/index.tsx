import React from 'react'
import style from './index.module.less'

interface LoaderProps {
  color?: string
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  children?: React.ReactNode
}

const Loader: React.FC<LoaderProps> = ({
  color = '#fff',
  size = 'medium',
  loading = true,
  children
}: LoaderProps) => {

  //todo size

  //直接显示children
  if (!loading) {
    return <>{children}</>
  }

  // 如果有children，显示相对定位的加载覆盖层
  if (children) {
    return (
      <div className="relative">
        {children}
        <div className="absolute inset-0 flex items-center justify-center bg-white/75 z-2000">
          <div className={style.loader}>
            {[1, 2, 3].map(i => <li key={i} className={style.ball} style={{ backgroundColor: color }}></li>)}
          </div>
        </div>
      </div>
    )
  }

  // 默认的全屏加载器
  return (
    <div className='flex items-center justify-center w-full h-full'>
      <div className={style.loader}>
        {[1, 2, 3].map(i => <li key={i} className={style.ball} style={{ backgroundColor: color }}></li>)}
      </div>
    </div>
  )
}
export default Loader