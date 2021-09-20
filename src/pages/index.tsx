import Head from 'next/head'
import styled from 'styled-components'
import Layout, { siteTitle } from '@/components/layout'
import utilStyles from '@/styles/utils.module.css'

export default function Home() {
  const Introduce = styled.p`
    font-size: 24px;
    font-weight: bold;
  `
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <Introduce>Hello I'm Tsuyoshi.<br />I'm workign frontend engineer in Japan.</Introduce>
        <p>(This is a sample website - you’ll be building a site like this on <a href="https://nextjs.org/learn">our Next.js tutorial</a>.)</p>
      </section>
    </Layout>
  )
}
