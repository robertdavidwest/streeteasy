--
-- PostgreSQL database dump
--

\restrict QSZ7q7ofb7lO4abDf0n9zSxKkjJDEbwtxyTEsICPmc6jFYw9ncAM3tlGfhYg1BS

-- Dumped from database version 17.7 (Debian 17.7-3.pgdg13+1)
-- Dumped by pg_dump version 17.9 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: rentals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rentals (
    id text NOT NULL,
    url text NOT NULL,
    bedrooms integer NOT NULL,
    bathrooms real NOT NULL,
    price integer NOT NULL
);


ALTER TABLE public.rentals OWNER TO postgres;

--
-- Data for Name: rentals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rentals (id, url, bedrooms, bathrooms, price) FROM stdin;
4979221	https://streeteasy.com/building/85-quay-street-brooklyn/707l	2	2	5650
4972086	https://streeteasy.com/building/87-commercial-street-brooklyn/1603n	2	2	4950
4952995	https://streeteasy.com/building/85-eagle-street-brooklyn/1l	2	1.5	4625
4978471	https://streeteasy.com/building/the-cleo/3e	2	1	4500
4980076	https://streeteasy.com/building/153-diamond-street-brooklyn/2	2	1	4200
4976640	https://streeteasy.com/building/114-calyer-street-brooklyn/2a	2	1	5500
4978220	https://streeteasy.com/building/292a-mc-guinness-blvd-brooklyn/2	2	2	4200
4974846	https://streeteasy.com/building/219-kingsland-avenue-brooklyn/7	2	2	3950
4975468	https://streeteasy.com/building/85-quay-street-brooklyn/7g	2	2	5650
4944874	https://streeteasy.com/building/42-clay-street-brooklyn/top	2	1	4444
4980840	https://streeteasy.com/building/273-driggs-avenue-brooklyn/2l	3	2	5300
4960879	https://streeteasy.com/building/230-franklin-street-brooklyn/g25	3	1	5500
4963345	https://streeteasy.com/building/the-seren/w709	2	2	5650
4972092	https://streeteasy.com/building/87-commercial-street-brooklyn/1109n	2	2	5000
4973553	https://streeteasy.com/building/77-commercial-street-brooklyn/2226	2	2	5062
4973682	https://streeteasy.com/building/199-java-street-brooklyn/2r	3	2	4700
4964648	https://streeteasy.com/building/197-franklin-street-brooklyn/3b	2	1	5000
4964817	https://streeteasy.com/building/145-noble-street-brooklyn/17	3	1	4950
4970751	https://streeteasy.com/building/87-commercial-street-brooklyn/2009n	2	2	5061
4969901	https://streeteasy.com/building/85-quay-street-brooklyn/809	2	2	5700
4970610	https://streeteasy.com/building/166-meserole-avenue-brooklyn/3	3	1	4850
4970017	https://streeteasy.com/building/77-commercial-street-brooklyn/2226s	2	2	5065
4970765	https://streeteasy.com/building/87-commercial-street-brooklyn/2908n	2	2	5061
4975108	https://streeteasy.com/building/77-commercial-street-brooklyn/2132s	2	2	4950
4981173	https://streeteasy.com/building/158-newton-street-brooklyn/4	2	2	5350
4966852	https://streeteasy.com/building/85-commercial-street-brooklyn/14j	2	2	5000
4963983	https://streeteasy.com/building/152-norman-avenue-brooklyn/2r	2	1	4495
4981686	https://streeteasy.com/building/142-franklin-street-brooklyn/2bb	2	1	3895
4977138	https://streeteasy.com/building/the-freeman-corner/5c	2	1	4500
4965840	https://streeteasy.com/building/115-greenpoint-avenue-brooklyn/d1	3	1	4900
4969206	https://streeteasy.com/building/the-charlotte/4a	2	1	5230
4974876	https://streeteasy.com/building/44-kent-brooklyn/312	2	1	5000
4977763	https://streeteasy.com/building/158-noble-street-brooklyn/2	2	1	5500
4981046	https://streeteasy.com/building/150-norman-avenue-brooklyn/2b	2	2	4099
4979812	https://streeteasy.com/building/franklin-court/512	2	1	5200
4953951	https://streeteasy.com/building/983-manhattan-avenue-brooklyn/2r	2	1	4400
4975227	https://streeteasy.com/building/511-meeker-avenue-brooklyn/2k	2	1	3500
4964764	https://streeteasy.com/building/107-greenpoint-avenue-brooklyn/a2	2	1	3900
4978843	https://streeteasy.com/building/77-commercial-street-brooklyn/2132sn	2	2	4950
4967489	https://streeteasy.com/building/the-seren/502	2	2	5800
4967595	https://streeteasy.com/building/the-seren/626	2	2	5725
4967996	https://streeteasy.com/building/the-seren/318	2	2	5725
4968019	https://streeteasy.com/building/the-seren/822	2	2	5850
4968048	https://streeteasy.com/building/the-seren/933	2	1.5	5750
4968201	https://streeteasy.com/building/the-seren/729	2	2	5600
4960623	https://streeteasy.com/building/272-driggs-avenue-brooklyn/3r	2	1	5150
4970909	https://streeteasy.com/building/193-greenpoint-avenue-brooklyn/2c	2	2	4900
4957954	https://streeteasy.com/building/179-norman-avenue-brooklyn/3	2	1.5	5100
4978554	https://streeteasy.com/building/6-sutton-street-brooklyn/3	3	2	5500
4983344	https://streeteasy.com/building/75-green-street-brooklyn/4b	3	2	5300
4983411	https://streeteasy.com/building/273-driggs-avenue-brooklyn/2a	3	2	5300
4983495	https://streeteasy.com/building/490-graham-avenue-brooklyn/2	2	1	4800
4969939	https://streeteasy.com/building/otto-greenpoint/450	2	2	5700
4984069	https://streeteasy.com/building/85-quay-street-brooklyn/7d	2	2	5650
4982439	https://streeteasy.com/building/192-greenpoint-avenue-brooklyn/2l	2	2	2784
4984264	https://streeteasy.com/building/85-commercial-street-brooklyn/6u	2	1	5000
4977982	https://streeteasy.com/building/106-huron-street-brooklyn/1r	2	2.5	5000
4971556	https://streeteasy.com/building/85-quay-street-brooklyn/7b	2	2	5695
4984775	https://streeteasy.com/building/85-quay-street-brooklyn/709a	2	2	5650
4984940	https://streeteasy.com/building/159-newel-street-brooklyn/4l	3	1	5095
4984904	https://streeteasy.com/building/88-clay-street-brooklyn/3l	3	2	4500
4984806	https://streeteasy.com/building/75-green-street-brooklyn/3b	2	1	4730
4984849	https://streeteasy.com/building/85-quay-street-brooklyn/707a	2	2	5650
4985595	https://streeteasy.com/building/151-dupont-street-brooklyn/2r	2	1	3850
4986644	https://streeteasy.com/building/the-freeman-corner/501	2	1	4350
4986646	https://streeteasy.com/building/franklin-court/522	2	1	5050
4985706	https://streeteasy.com/building/103-java-street-brooklyn/1l	2	1	5000
4986273	https://streeteasy.com/building/87-commercial-street-brooklyn/2909n	2	1	5000
4986260	https://streeteasy.com/building/87-commercial-street-brooklyn/1604n	2	2	5000
4987370	https://streeteasy.com/building/511-meeker-avenue-brooklyn/2m	2	1	3500
4987811	https://streeteasy.com/building/56-hausman-street-brooklyn/3	3	2	4700
4986284	https://streeteasy.com/building/87-commercial-street-brooklyn/2102n	2	1	5000
4987579	https://streeteasy.com/building/97-clay-street-brooklyn/3	2	1	3400
4988010	https://streeteasy.com/building/44-kent-brooklyn/307	2	1	4800
4988150	https://streeteasy.com/building/42-driggs-avenue-brooklyn/3l	2	2	4499
4986328	https://streeteasy.com/building/44-kent-brooklyn/290	2	1	5500
4987911	https://streeteasy.com/building/42-driggs-avenue-brooklyn/2r	2	2	4500
4986254	https://streeteasy.com/building/87-commercial-street-brooklyn/1110n	2	2	5000
4988235	https://streeteasy.com/building/44-kent-brooklyn/320	2	1	5000
4981258	https://streeteasy.com/building/115-greenpoint-avenue-brooklyn/c1	3	2	5800
4989371	https://streeteasy.com/building/273-driggs-avenue-brooklyn/3a	3	2	5300
4989498	https://streeteasy.com/building/107-greenpoint-avenue-brooklyn/d4	2	1	3800
4989776	https://streeteasy.com/building/245-kingsland-avenue-brooklyn/2l	2	2	5000
4990034	https://streeteasy.com/building/184-java-street-brooklyn/3r	3	3	5000
4990115	https://streeteasy.com/building/85-commercial-street-brooklyn/21f	2	2	5150
4990626	https://streeteasy.com/building/35a-driggs-avenue-brooklyn/2r	2	1	2975
4991062	https://streeteasy.com/building/77-commercial-street-brooklyn/2312en	2	2	4950
4991136	https://streeteasy.com/building/115-greenpoint-avenue-brooklyn/a4	3	1	4900
4991422	https://streeteasy.com/building/franklin-court/523	2	1	5000
4990896	https://streeteasy.com/building/1048-manhattan-avenue-brooklyn/2a	3	2	4065
4992129	https://streeteasy.com/building/110-franklin-street-brooklyn/2	2	1	4200
4992252	https://streeteasy.com/building/85-quay-street-brooklyn/8a	2	2	5700
4992395	https://streeteasy.com/building/the-freeman-corner/5e	2	1	4350
4992882	https://streeteasy.com/building/44-kent-brooklyn/299	2	1	5400
4992789	https://streeteasy.com/building/the-charlotte/4a	2	1	4775
4993802	https://streeteasy.com/building/44-kent-brooklyn/308	2	1	4800
4994031	https://streeteasy.com/building/219-kingsland-avenue-brooklyn/11	2	2	3700
4994883	https://streeteasy.com/building/262-franklin-street-brooklyn/ph1	2	1.5	4500
4994888	https://streeteasy.com/building/35a-driggs-avenue-brooklyn/3l	2	1	3500
4994624	https://streeteasy.com/building/193-greenpoint-avenue-brooklyn/3b	2	2	4800
4995317	https://streeteasy.com/building/152-norman-avenue-brooklyn/2a	2	1	4250
4994104	https://streeteasy.com/building/75-mcguinness-boulevard-brooklyn/6b	2	2	5500
\.


--
-- Name: rentals rentals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rentals
    ADD CONSTRAINT rentals_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict QSZ7q7ofb7lO4abDf0n9zSxKkjJDEbwtxyTEsICPmc6jFYw9ncAM3tlGfhYg1BS

