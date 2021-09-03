import Head from 'next/head'
import styled from 'styled-components'
// import styles from '../../styles/Home.module.css'

export default function Home() {
  const HeadingH1 = styled.h1`
    font-size: 16px;
    color: blue;
  `
  return (
    <HeadingH1>Index</HeadingH1>
  )
}
