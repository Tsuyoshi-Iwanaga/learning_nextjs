import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import styled from 'styled-components'
// import styles from '../../styles/Home.module.css'

export default function Home() {
  const HeadingH1 = styled.h1`
    font-size: 16px;
    color: blue;
  `
  return (
    <>
      <HeadingH1>Index</HeadingH1>
      Read→{' '}
      <Link href="/posts/first-post"><a>postPage</a></Link>
      <div>
        <Image src="/images/profile.png" height={144} width={144} alt="" />
      </div>
    </>
  )
}
