# -*- coding: utf-8 -*-
"""Banque de questions des évaluations du jour et cartes mémo. Produit tools/seed.sql.
Format : (chapitre, partie, type, titre, énoncé HTML, corrigé HTML). Les formules sont en \\( \\)."""
CH2, CH3, CH4 = 'Ch. II Suites et fonctions', 'Ch. III Algèbre linéaire', 'Ch. IV Limites de suites'
Q = []
def q(ch, partie, typ, titre, enonce, corrige): Q.append((ch, partie, typ, titre, enonce, corrige))

# ---------------- Chapitre II ----------------
P = 'Suites : bornées, monotonie, récurrence'
q(CH2, P, 'cours', "Suites majorées, minorées, bornées",
  r"<p>Donner la définition d'une suite majorée, d'une suite minorée, d'une suite bornée.</p>",
  r"<p>\(u\) est majorée s'il existe \(M\in\R\) tel que \(\forall n\in\N,\ u_n\leq M\) ; minorée s'il existe \(m\in\R\) tel que \(\forall n,\ m\leq u_n\) ; bornée si elle est majorée et minorée, c'est-à-dire s'il existe \(K\geq0\) tel que \(\forall n,\ |u_n|\leq K\).</p><p>Le majorant \(M\) est une constante : il ne dépend pas de \(n\).</p>")
q(CH2, P, 'cours', "Le raisonnement par récurrence",
  r"<p>Écrire le schéma complet d'une démonstration par récurrence de « \(\forall n\geq n_0,\ \mathcal P(n)\) ».</p>",
  r"<p><b>Initialisation</b> : on vérifie \(\mathcal P(n_0)\). <b>Hérédité</b> : soit \(n\geq n_0\) tel que \(\mathcal P(n)\) est vraie ; on en déduit \(\mathcal P(n+1)\). <b>Conclusion</b> : par récurrence, \(\mathcal P(n)\) est vraie pour tout \(n\geq n_0\).</p><p>On suppose \(\mathcal P(n)\) pour <em>un</em> \(n\) fixé, jamais « pour tout \(n\) ».</p>")
q(CH2, P, 'demo', "Une suite périodique est bornée",
  r"<p>Montrer qu'une suite périodique est bornée.</p>",
  r"<p>Soit \(T\geq1\) une période et \(K=\max\{|u_0|,\dots,|u_{T-1}|\}\).</p><p>Par récurrence sur \(q\) : \(u_{n+qT}=u_n\) pour tout \(n\) (vrai pour \(q=0\) ; si \(u_{n+qT}=u_n\), alors \(u_{n+(q+1)T}=u_{(n+qT)+T}=u_{n+qT}=u_n\)).</p><p>Soit \(n\in\N\) : \(n=qT+r\) avec \(0\leq r\leq T-1\), donc \(u_n=u_r\) et \(|u_n|\leq K\). La suite est bornée.</p>")
q(CH2, P, 'demo', "Majorée à partir d'un certain rang",
  r"<p>Montrer que si \(u\) est majorée à partir d'un certain rang, alors \(u\) est majorée.</p>",
  r"<p>Il existe \(M\) et \(n_0\) tels que \(u_n\leq M\) pour \(n\geq n_0\). Posons \(M'=\max\{M,u_0,\dots,u_{n_0-1}\}\) (nombre fini de réels).</p><p>Si \(n<n_0\), \(u_n\) est dans la liste donc \(u_n\leq M'\) ; si \(n\geq n_0\), \(u_n\leq M\leq M'\). Donc \(u\) est majorée par \(M'\).</p>")
q(CH2, P, 'exercice', "Encadrement et monotonie par récurrence",
  r"<p>Soit \(u_0=1\) et \(u_{n+1}=\sqrt{u_n+6}\).</p><p><b>a.</b> Montrer que \(0\leq u_n\leq3\) pour tout \(n\). <b>b.</b> Montrer que \(u\) est croissante.</p>",
  r"<p><b>a.</b> \(\mathcal P(n)\) : « \(0\leq u_n\leq3\) ». \(u_0=1\). Si \(0\leq u_n\leq3\), alors \(6\leq u_n+6\leq9\) et par croissance de la racine, \(\sqrt6\leq u_{n+1}\leq3\).</p><p><b>b.</b> \(\mathcal Q(n)\) : « \(u_n\leq u_{n+1}\) ». \(u_1=\sqrt7\geq1=u_0\). Si \(u_n\leq u_{n+1}\), alors \(u_n+6\leq u_{n+1}+6\), donc \(u_{n+1}\leq u_{n+2}\). La suite est croissante.</p>")
q(CH2, P, 'exercice', "Monotonie par le quotient",
  r"<p>Étudier la monotonie de \(u_n=\dfrac{3^n}{n!}\) pour \(n\geq1\).</p>",
  r"<p>\(u_n>0\) et \(\dfrac{u_{n+1}}{u_n}=\dfrac{3}{n+1}\).</p><p>Pour \(n=1\) : le quotient vaut \(\frac32>1\), donc \(u_2>u_1\). Pour \(n\geq2\) : \(\frac3{n+1}\leq1\), donc \(u_{n+1}\leq u_n\).</p><p>La suite croît de \(u_1=3\) à \(u_2=\frac92\), puis elle est décroissante à partir du rang 2.</p>")

P = 'Suites particulières : arithmétiques, géométriques, récurrentes'
q(CH2, P, 'cours', "Suites géométriques",
  r"<p>Soit \(u\) géométrique de raison \(a\neq1\). Donner \(u_n\) en fonction de \(u_{n_0}\), et la somme \(u_{n_0}+\dots+u_{n_0+k}\).</p>",
  r"<p>\(u_n=u_{n_0}\,a^{n-n_0}\) et \(u_{n_0}+\dots+u_{n_0+k}=u_{n_0}\dfrac{1-a^{k+1}}{1-a}\) (il y a \(k+1\) termes).</p>")
q(CH2, P, 'cours', "Récurrences linéaires d'ordre 2",
  r"<p>Soit \(u_{n+2}=au_{n+1}+bu_n\). Donner la forme de \(u_n\) selon les racines de l'équation caractéristique.</p>",
  r"<p>Équation caractéristique : \(r^2=ar+b\). Deux racines réelles distinctes \(r_1,r_2\) : \(u_n=\lambda r_1^n+\mu r_2^n\). Une racine double \(r\) : \(u_n=(\lambda n+\mu)r^n\). On trouve \(\lambda,\mu\) avec \(u_0\) et \(u_1\).</p>")
q(CH2, P, 'demo', "Suites arithmético-géométriques",
  r"<p>Soit \(u_{n+1}=au_n+b\) avec \(a\neq1\), et \(\ell\) tel que \(\ell=a\ell+b\). Montrer que \((u_n-\ell)\) est géométrique et en déduire \(u_n\).</p>",
  r"<p>En soustrayant \(\ell=a\ell+b\) à \(u_{n+1}=au_n+b\) : \(u_{n+1}-\ell=a(u_n-\ell)\). Donc \((u_n-\ell)\) est géométrique de raison \(a\) : \(u_n-\ell=a^n(u_0-\ell)\), soit \(u_n=\ell+a^n(u_0-\ell)\).</p>")
q(CH2, P, 'demo', "Somme géométrique",
  r"<p>Démontrer que pour \(q\neq1\), \(1+q+\dots+q^n=\dfrac{1-q^{n+1}}{1-q}\).</p>",
  r"<p>Soit \(\Sigma=1+q+\dots+q^n\). Alors \(q\Sigma=q+\dots+q^{n+1}\), donc \(\Sigma-q\Sigma=1-q^{n+1}\) (les autres termes se simplifient), soit \((1-q)\Sigma=1-q^{n+1}\). Comme \(q\neq1\), on divise par \(1-q\).</p>")
q(CH2, P, 'exercice', "Une suite arithmético-géométrique",
  r"<p>Soit \(u_0=2\) et \(u_{n+1}=3u_n-2\). Déterminer \(u_n\) en fonction de \(n\).</p>",
  r"<p>\(\ell=3\ell-2\) donne \(\ell=1\). \(u_{n+1}-1=3(u_n-1)\), donc \(u_n-1=3^n(u_0-1)=3^n\).</p><p>\(u_n=1+3^n\). Vérification : \(u_1=4=3\times2-2\).</p>")
q(CH2, P, 'exercice', "Une récurrence d'ordre 2",
  r"<p>Soit \(u_0=0\), \(u_1=1\) et \(u_{n+2}=u_{n+1}+2u_n\). Déterminer \(u_n\).</p>",
  r"<p>\(r^2-r-2=(r-2)(r+1)=0\) : \(u_n=\lambda2^n+\mu(-1)^n\). \(\lambda+\mu=0\) et \(2\lambda-\mu=1\), donc \(\lambda=\frac13\), \(\mu=-\frac13\).</p><p>\(u_n=\dfrac{2^n-(-1)^n}3\). Vérification : \(u_2=1=\frac{4-1}3\).</p>")
q(CH2, P, 'exercice', "Suites couplées et matrices",
  r"<p>\(u_0=v_0=1\), \(u_{n+1}=2u_n+v_n\), \(v_{n+1}=2v_n\). <b>a.</b> Écrire \(X_{n+1}=AX_n\). <b>b.</b> Calculer \(A^n\). <b>c.</b> En déduire \(u_n\).</p>",
  r"<p><b>a.</b> \(X_n=\begin{pmatrix}u_n\\v_n\end{pmatrix}\), \(A=\begin{pmatrix}2&1\\0&2\end{pmatrix}\), et par récurrence \(X_n=A^nX_0\).</p><p><b>b.</b> \(A=2I+N\), \(N=\begin{pmatrix}0&1\\0&0\end{pmatrix}\), \(N^2=0\), \(2I\) et \(N\) commutent : \(A^n=2^nI+n2^{n-1}N\).</p><p><b>c.</b> \(u_n=2^n+n2^{n-1}\), \(v_n=2^n\).</p>")

P = 'Fonctions : propriétés, continuité, dérivation'
q(CH2, P, 'cours', "Valeurs intermédiaires et bijection",
  r"<p>Énoncer le théorème des valeurs intermédiaires et son corollaire pour une fonction strictement monotone.</p>",
  r"<p><b>TVI</b> : si \(f\) est continue sur un intervalle \(I\), \(a<b\) dans \(I\) et \(k\) compris entre \(f(a)\) et \(f(b)\), il existe \(c\in[a,b]\) tel que \(f(c)=k\).</p><p><b>Corollaire</b> : si de plus \(f\) est strictement monotone sur \(I\), elle réalise une bijection de \(I\) sur \(f(I)\) : chaque valeur de \(f(I)\) a un unique antécédent.</p>")
q(CH2, P, 'cours', "Parité et périodicité",
  r"<p>Donner les définitions d'une fonction paire, impaire, \(T\)-périodique.</p>",
  r"<p>Sur \(D\) symétrique par rapport à 0 : paire si \(f(-x)=f(x)\), impaire si \(f(-x)=-f(x)\) pour tout \(x\in D\). \(T\)-périodique (\(T>0\)) si pour tout \(x\in D\), \(x\pm T\in D\) et \(f(x+T)=f(x)\).</p>")
q(CH2, P, 'demo', "Une fonction non périodique",
  r"<p>Montrer que \(f:x\mapsto x+\sin x\) n'est pas périodique.</p>",
  r"<p>Par l'absurde, soit \(T>0\) une période. Alors \(f(nT)=f(0)=0\) pour tout \(n\in\N\). Or \(f(nT)=nT+\sin(nT)\geq nT-1>0\) dès que \(n>\frac1T\). Contradiction.</p>")
q(CH2, P, 'exercice', "Unique solution d'une équation",
  r"<p>Montrer que l'équation \(x^3+3x-1=0\) admet une unique solution dans \([0,1]\).</p>",
  r"<p>\(f(x)=x^3+3x-1\) est continue sur \([0,1]\), et \(f'(x)=3x^2+3>0\) : \(f\) est strictement croissante. \(f(0)=-1<0\) et \(f(1)=3>0\). D'après le corollaire du TVI, l'équation a une unique solution dans \([0,1]\).</p>")
q(CH2, P, 'exercice', "Asymptotes",
  r"<p>Déterminer les asymptotes de \(f(x)=\dfrac{x^2+x+1}{x-1}\).</p>",
  r"<p>\(f(x)=x+2+\dfrac3{x-1}\). Asymptote verticale \(x=1\) (\(f\to\pm\infty\) en 1). Asymptote oblique \(y=x+2\) en \(\pm\infty\), car \(f(x)-(x+2)=\frac3{x-1}\to0\).</p>")

P = 'Exponentielle, logarithme, puissances'
q(CH2, P, 'cours', "Croissances comparées",
  r"<p>Donner, pour \(n\in\N^*\), les limites de \(\frac{e^x}{x^n}\) et \(x^ne^x\) (en \(+\infty\) et \(-\infty\)), puis de \(\frac{\ln x}{x^n}\) et \(x^n\ln x\) (en \(+\infty\) et \(0^+\)).</p>",
  r"<p>\(\frac{e^x}{x^n}\to+\infty\) en \(+\infty\) ; \(x^ne^x\to0\) en \(-\infty\) ; \(\frac{\ln x}{x^n}\to0\) en \(+\infty\) ; \(x^n\ln x\to0\) en \(0^+\) (par valeurs négatives).</p>")
q(CH2, P, 'demo', "L'exponentielle est strictement positive",
  r"<p>On admet \(e^{x+y}=e^xe^y\) et \(e^x\neq0\). Montrer que \(e^x>0\) pour tout réel \(x\).</p>",
  r"<p>\(e^x=e^{\frac x2+\frac x2}=\left(e^{x/2}\right)^2\geq0\), et \(e^x\neq0\), donc \(e^x>0\).</p>")
q(CH2, P, 'demo', "Le lemme des croissances comparées",
  r"<p>On admet \(e^t\geq1+t\) pour tout \(t\). Montrer que \(\frac{e^x}x\to+\infty\) en \(+\infty\).</p>",
  r"<p>Pour \(x>0\) : \(e^{x/2}\geq1+\frac x2>0\), on élève au carré : \(e^x\geq1+x+\frac{x^2}4\geq\frac{x^2}4\). Donc \(\frac{e^x}x\geq\frac x4\to+\infty\), et par comparaison \(\frac{e^x}x\to+\infty\).</p>")
q(CH2, P, 'exercice', "Une équation avec des logarithmes",
  r"<p>Résoudre \(\ln(x+1)+\ln(x-1)=\ln3\).</p>",
  r"<p>Domaine : \(x>1\). L'équation équivaut à \(\ln(x^2-1)=\ln3\), donc (\(\ln\) injective) \(x^2-1=3\), \(x=\pm2\). Seul \(x=2\) est dans le domaine : \(S=\{2\}\).</p>")
q(CH2, P, 'exercice', "Trois limites",
  r"<p>Calculer : <b>a.</b> \(\lim\limits_{x\to0}\frac{e^{2x}-1}x\) ; <b>b.</b> \(\lim\limits_{x\to+\infty}x^2e^{-x}\) ; <b>c.</b> \(\lim\limits_{x\to+\infty}\frac{\ln x}{\sqrt x}\).</p>",
  r"<p><b>a.</b> \(2\cdot\frac{e^{2x}-1}{2x}\to2\). <b>b.</b> \(\frac{x^2}{e^x}\to0\). <b>c.</b> avec \(t=\sqrt x\) : \(\frac{2\ln t}t\to0\).</p>")

# ---------------- Chapitre III ----------------
P = 'Calcul matriciel'
q(CH3, P, 'cours', "Le produit de deux matrices",
  r"<p>Pour quelles tailles le produit \(AB\) est-il défini ? Quelle est sa taille ? Donner le coefficient \((AB)_{ij}\).</p>",
  r"<p>Si \(A\in\mathcal M_{n,p}\) et \(B\in\mathcal M_{p,q}\) (colonnes de \(A\) = lignes de \(B\)), \(AB\in\mathcal M_{n,q}\) et \((AB)_{ij}=\displaystyle\sum_{k=1}^pa_{ik}b_{kj}\).</p>")
q(CH3, P, 'cours', "La transposée",
  r"<p>Donner \((A+B)^T\), \((\lambda A)^T\), \((AB)^T\) et \((A^T)^T\).</p>",
  r"<p>\((A+B)^T=A^T+B^T\), \((\lambda A)^T=\lambda A^T\), \((AB)^T=B^TA^T\) (l'ordre s'inverse), \((A^T)^T=A\).</p>")
q(CH3, P, 'demo', "Produit des matrices élémentaires",
  r"<p>Montrer que \(E_{ij}E_{kl}=\delta_{jk}E_{il}\) dans \(\mathcal M_n(\R)\).</p>",
  r"<p>\((E_{ij})_{pr}=\delta_{ip}\delta_{jr}\). Le coefficient \((p,q)\) du produit vaut \(\sum_r\delta_{ip}\delta_{jr}\delta_{kr}\delta_{lq}\). Seul \(r=j\) peut contribuer, et il faut aussi \(r=k\) : la somme vaut \(\delta_{ip}\delta_{lq}\delta_{jk}\), qui est le coefficient \((p,q)\) de \(\delta_{jk}E_{il}\).</p>")
q(CH3, P, 'demo', "Transposée d'un produit",
  r"<p>Montrer que \((AB)^T=B^TA^T\).</p>",
  r"<p>\(((AB)^T)_{ij}=(AB)_{ji}=\sum_ka_{jk}b_{ki}=\sum_k(B^T)_{ik}(A^T)_{kj}=(B^TA^T)_{ij}\). Les tailles correspondent aussi, d'où l'égalité.</p>")
q(CH3, P, 'exercice', "Deux matrices qui ne commutent pas",
  r"<p>\(A=\begin{pmatrix}1&2\\0&1\end{pmatrix}\), \(B=\begin{pmatrix}1&0\\1&1\end{pmatrix}\). Calculer \(AB\) et \(BA\). Commutent-elles ?</p>",
  r"<p>\(AB=\begin{pmatrix}3&2\\1&1\end{pmatrix}\) et \(BA=\begin{pmatrix}1&2\\1&3\end{pmatrix}\). \(AB\neq BA\) : elles ne commutent pas.</p>")

P = 'Matrices inversibles et puissances'
q(CH3, P, 'cours', "Matrice inversible",
  r"<p>Définir une matrice inversible. Donner l'inverse de \(\begin{pmatrix}a&b\\c&d\end{pmatrix}\) quand il existe.</p>",
  r"<p>\(A\in\mathcal M_n(\R)\) est inversible s'il existe \(B\) telle que \(AB=BA=I_n\) ; on note \(B=A^{-1}\). Si \(ad-bc\neq0\) : \(A^{-1}=\dfrac1{ad-bc}\begin{pmatrix}d&-b\\-c&a\end{pmatrix}\).</p>")
q(CH3, P, 'cours', "Formule du binôme",
  r"<p>Énoncer la formule du binôme pour deux matrices, avec sa condition.</p>",
  r"<p>Si \(AB=BA\) : \((A+B)^n=\displaystyle\sum_{k=0}^n\binom nkA^kB^{n-k}\). Sans la condition \(AB=BA\), la formule est fausse.</p>")
q(CH3, P, 'demo', "Inverse à partir d'un polynôme annulateur",
  r"<p>On suppose \(A^2-3A+2I=0\). Montrer que \(A\) est inversible et donner \(A^{-1}\).</p>",
  r"<p>\(A^2-3A=-2I\), donc \(A\left(\frac{3I-A}2\right)=I\), et de même \(\left(\frac{3I-A}2\right)A=I\). Donc \(A\) est inversible et \(A^{-1}=\frac12(3I-A)\).</p>")
q(CH3, P, 'exercice', "Puissances par le binôme",
  r"<p>Calculer \(A^n\) pour \(A=\begin{pmatrix}3&1\\0&3\end{pmatrix}\).</p>",
  r"<p>\(A=3I+N\), \(N^2=0\), \(3I\) et \(N\) commutent : \(A^n=3^nI+n3^{n-1}N=\begin{pmatrix}3^n&n3^{n-1}\\0&3^n\end{pmatrix}\).</p>")
q(CH3, P, 'exercice', "Inverse d'une matrice 2×2",
  r"<p>Montrer que \(A=\begin{pmatrix}2&1\\5&3\end{pmatrix}\) est inversible et calculer \(A^{-1}\).</p>",
  r"<p>\(ad-bc=6-5=1\neq0\) : \(A^{-1}=\begin{pmatrix}3&-1\\-5&2\end{pmatrix}\). Vérification : \(AA^{-1}=I\).</p>")
q(CH3, P, 'exercice', "Puissances avec A² = 2A",
  r"<p>Soit \(A=\begin{pmatrix}1&1\\1&1\end{pmatrix}\). Calculer \(A^2\), puis \(A^n\) pour \(n\geq1\).</p>",
  r"<p>\(A^2=\begin{pmatrix}2&2\\2&2\end{pmatrix}=2A\). Par récurrence, \(A^n=2^{n-1}A\) : vrai pour \(n=1\), et \(A^{n+1}=A^nA=2^{n-1}A^2=2^nA\).</p>")

P = 'Espaces vectoriels et sous-espaces'
q(CH3, P, 'cours', "Caractériser un sous-espace vectoriel",
  r"<p>Énoncer la caractérisation d'un sous-espace vectoriel \(F\) d'un espace vectoriel \(E\).</p>",
  r"<p>\(F\) est un s.e.v. de \(E\) si \(F\subset E\), \(0_E\in F\), et pour tous \(u,v\in F\) et \(\lambda,\mu\in\R\), \(\lambda u+\mu v\in F\).</p>")
q(CH3, P, 'demo', "Intersection de deux sous-espaces",
  r"<p>Montrer que l'intersection de deux sous-espaces vectoriels \(F\) et \(G\) de \(E\) est un sous-espace vectoriel.</p>",
  r"<p>\(0\in F\) et \(0\in G\), donc \(0\in F\cap G\). Soit \(u,v\in F\cap G\) et \(\lambda,\mu\in\R\) : \(\lambda u+\mu v\in F\) (car \(F\) est un s.e.v.) et \(\lambda u+\mu v\in G\), donc \(\lambda u+\mu v\in F\cap G\).</p>")
q(CH3, P, 'demo', "Un plan de R³ par la définition",
  r"<p>Montrer par la définition que \(F=\{(x,y,z)\in\R^3\ ;\ x+y+z=0\}\) est un s.e.v. de \(\R^3\).</p>",
  r"<p>\(0+0+0=0\) : \((0,0,0)\in F\). Soit \(u=(x,y,z)\), \(v=(x',y',z')\) dans \(F\) et \(\lambda,\mu\) réels : la somme des coordonnées de \(\lambda u+\mu v\) vaut \(\lambda(x+y+z)+\mu(x'+y'+z')=0\). Donc \(\lambda u+\mu v\in F\).</p>")
q(CH3, P, 'exercice', "Sous-espace ou pas ?",
  r"<p>Les ensembles suivants sont-ils des s.e.v. de \(\R^2\) ? \(A=\{(x,y)\ ;\ xy=0\}\), \(B=\{(x,y)\ ;\ x=2y\}\), \(C=\{(x,y)\ ;\ x+y=1\}\).</p>",
  r"<p>\(A\) : non, \((1,0)\) et \((0,1)\) sont dans \(A\) mais pas leur somme \((1,1)\). \(B\) : oui, \(B=\Vect((2,1))\). \(C\) : non, \((0,0)\notin C\).</p>")
q(CH3, P, 'exercice', "Sous-espaces de fonctions",
  r"<p>\(F=\{f\in\mathcal F(\R,\R)\ ;\ f(0)=0\}\) et \(G=\{f\ ;\ f(0)=1\}\) sont-ils des s.e.v. ?</p>",
  r"<p>\(F\) : oui. La fonction nulle est dans \(F\), et \((\lambda f+\mu g)(0)=\lambda\cdot0+\mu\cdot0=0\). \(G\) : non, la fonction nulle n'y est pas.</p>")

P = 'Vect et familles génératrices'
q(CH3, P, 'cours', "Vect et famille génératrice",
  r"<p>Définir \(\Vect(u_1,\dots,u_p)\) et une famille génératrice de \(E\).</p>",
  r"<p>\(\Vect(u_1,\dots,u_p)=\{\lambda_1u_1+\dots+\lambda_pu_p\ ;\ \lambda_i\in\R\}\), l'ensemble des combinaisons linéaires. \((u_1,\dots,u_p)\) est génératrice de \(E\) si \(E=\Vect(u_1,\dots,u_p)\) : tout vecteur de \(E\) est une combinaison linéaire des \(u_i\).</p>")
q(CH3, P, 'demo', "Un Vect est un sous-espace vectoriel",
  r"<p>Montrer que \(\Vect(u,v)\) est un sous-espace vectoriel de \(E\).</p>",
  r"<p>\(0=0u+0v\in\Vect(u,v)\). Si \(x=au+bv\) et \(y=cu+dv\), alors \(\lambda x+\mu y=(\lambda a+\mu c)u+(\lambda b+\mu d)v\in\Vect(u,v)\).</p>")
q(CH3, P, 'exercice', "D'une équation à un Vect",
  r"<p>Écrire \(F=\{(x,y,z)\ ;\ x-y+z=0\}\) sous la forme d'un Vect et en donner une famille génératrice.</p>",
  r"<p>\((x,y,z)\in F\iff y=x+z\iff(x,y,z)=x(1,1,0)+z(0,1,1)\). Donc \(F=\Vect((1,1,0),(0,1,1))\), et cette famille est génératrice de \(F\).</p>")
q(CH3, P, 'exercice', "Deux équations",
  r"<p>Écrire \(F=\{(x,y,z)\ ;\ x+y=0\ \text{et}\ y-z=0\}\) sous la forme d'un Vect.</p>",
  r"<p>\(x=-y\) et \(z=y\) : \((x,y,z)=y(-1,1,1)\). Donc \(F=\Vect((-1,1,1))\), une droite.</p>")
q(CH3, P, 'exercice', "Une famille génératrice de R²",
  r"<p>La famille \(((1,1),(1,-1))\) est-elle génératrice de \(\R^2\) ?</p>",
  r"<p>Soit \((x,y)\in\R^2\). On cherche \(a,b\) avec \(a+b=x\) et \(a-b=y\) : \(a=\frac{x+y}2\), \(b=\frac{x-y}2\) conviennent. Tout vecteur est donc combinaison des deux : la famille est génératrice.</p>")

# ---------------- Chapitre IV ----------------
P = 'Convergence : définition, unicité, limites infinies'
q(CH4, P, 'cours', "Convergence et limite infinie",
  r"<p>Écrire avec les quantificateurs : « \(u\) converge vers \(\ell\) » et « \(u\) tend vers \(+\infty\) ».</p>",
  r"<p>\(\forall\varepsilon>0,\ \exists n_0\in\N,\ \forall n\geq n_0,\ |u_n-\ell|<\varepsilon\). \(\quad\forall A\in\R,\ \exists n_0\in\N,\ \forall n\geq n_0,\ u_n\geq A\).</p>")
q(CH4, P, 'demo', "Unicité de la limite",
  r"<p>Montrer que la limite d'une suite convergente est unique.</p>",
  r"<p>Par l'absurde, \(\ell<\ell'\) deux limites. Avec \(\varepsilon=\frac{\ell'-\ell}3\), il existe \(n_1\) (resp. \(n_2\)) au-delà duquel \(|u_n-\ell|<\varepsilon\) (resp. \(|u_n-\ell'|<\varepsilon\)). Pour \(N=\max\{n_1,n_2\}\) : \(u_N<\ell+\varepsilon<\ell'-\varepsilon<u_N\), absurde.</p>")
q(CH4, P, 'demo', "La suite (−1)ⁿ diverge",
  r"<p>Montrer que la suite \(\left((-1)^n\right)\) ne converge pas.</p>",
  r"<p>Par l'absurde, si elle converge vers \(\ell\) : avec \(\varepsilon=\frac12\), pour \(n\geq n_0\), \(|u_n-\ell|<\frac12\), donc \(|u_{n+1}-u_n|<1\) (inégalité triangulaire). Or \(|u_{n+1}-u_n|=2\). Absurde.</p>")
q(CH4, P, 'exercice', "Convergence par la définition",
  r"<p>Montrer avec la définition que \(u_n=\dfrac{2n+3}{n+1}\to2\).</p>",
  r"<p>\(|u_n-2|=\frac1{n+1}\). Soit \(\varepsilon>0\), \(n_0=\lfloor\frac1\varepsilon\rfloor+1\). Pour \(n\geq n_0\) : \(n+1>\frac1\varepsilon\), donc \(|u_n-2|<\varepsilon\).</p>")
q(CH4, P, 'exercice', "Limite infinie par la définition",
  r"<p>Montrer avec la définition que \(\sqrt n\to+\infty\).</p>",
  r"<p>Soit \(A\in\R\), \(n_0=\lfloor A^2\rfloor+1\). Pour \(n\geq n_0\) : \(n>A^2\), donc \(\sqrt n>|A|\geq A\).</p>")

P = 'Propriétés et opérations sur les limites'
q(CH4, P, 'cours', "Propriétés des suites convergentes",
  r"<p>Énoncer la proposition IV-3 (convergente ⇒ …) et la proposition IV-5 (passage à la limite dans les inégalités).</p>",
  r"<p><b>IV-3</b> : une suite convergente est bornée ; si \(u\to\ell\neq0\), \(u_n\) est non nul et du signe de \(\ell\) à partir d'un certain rang.</p><p><b>IV-5</b> : si \(u\to\ell\), \(v\to\ell'\) et \(u_n\leq v_n\) à partir d'un certain rang, alors \(\ell\leq\ell'\). Les inégalités strictes deviennent larges.</p>")
q(CH4, P, 'demo', "Une suite convergente est bornée",
  r"<p>Montrer qu'une suite convergente est bornée.</p>",
  r"<p>Avec \(\varepsilon=1\) : pour \(n\geq n_0\), \(\ell-1<u_n<\ell+1\). Avec \(m=\min\{u_0,\dots,u_{n_0-1},\ell-1\}\) et \(M=\max\{u_0,\dots,u_{n_0-1},\ell+1\}\) : \(m\leq u_n\leq M\) pour tout \(n\).</p>")
q(CH4, P, 'demo', "Bornée fois « tend vers 0 »",
  r"<p>Montrer que si \(u\) est bornée et \(v_n\to0\), alors \(u_nv_n\to0\).</p>",
  r"<p>Soit \(K>0\) avec \(|u_n|\leq K\). Soit \(\varepsilon>0\) : il existe \(n_0\) tel que pour \(n\geq n_0\), \(|v_n|<\frac\varepsilon K\). Alors \(|u_nv_n|<K\cdot\frac\varepsilon K=\varepsilon\).</p>")
q(CH4, P, 'exercice', "Trois limites",
  r"<p>Déterminer les limites de : <b>a.</b> \(\frac{3n^2-n}{n^2+1}\) ; <b>b.</b> \(\sqrt{n^2+3n}-n\) ; <b>c.</b> \(\frac{n+(-1)^n}{n+2}\).</p>",
  r"<p><b>a.</b> \(\frac{3-\frac1n}{1+\frac1{n^2}}\to3\). <b>b.</b> \(\frac{3n}{\sqrt{n^2+3n}+n}=\frac3{\sqrt{1+\frac3n}+1}\to\frac32\). <b>c.</b> \(\frac{1+\frac{(-1)^n}n}{1+\frac2n}\to1\).</p>")

P = 'Encadrement et comparaison'
q(CH4, P, 'cours', "Gendarmes et comparaison",
  r"<p>Énoncer le théorème des gendarmes et la proposition IV-9 (comparaison et limites infinies).</p>",
  r"<p><b>Gendarmes</b> : si \(u_n\leq v_n\leq w_n\) à partir d'un certain rang et \(u,w\) convergent vers le même \(\ell\), alors \(v\) converge et \(\lim v=\ell\).</p><p><b>IV-9</b> : si \(u_n\leq v_n\) à partir d'un certain rang : \(u\to+\infty\Rightarrow v\to+\infty\), et \(v\to-\infty\Rightarrow u\to-\infty\).</p>")
q(CH4, P, 'demo', "Le théorème des gendarmes",
  r"<p>Démontrer le théorème des gendarmes.</p>",
  r"<p>Soit \(\varepsilon>0\). Il existe \(n_0,n_1,n_2\) tels que : \(\ell-\varepsilon<u_n<\ell+\varepsilon\) pour \(n\geq n_0\) ; \(\ell-\varepsilon<w_n<\ell+\varepsilon\) pour \(n\geq n_1\) ; \(u_n\leq v_n\leq w_n\) pour \(n\geq n_2\). Pour \(n\geq\max\{n_0,n_1,n_2\}\) : \(\ell-\varepsilon<u_n\leq v_n\leq w_n<\ell+\varepsilon\), donc \(|v_n-\ell|<\varepsilon\).</p>")
q(CH4, P, 'exercice', "Une somme encadrée",
  r"<p>Déterminer la limite de \(u_n=\displaystyle\sum_{k=1}^n\frac n{n^2+k}\).</p>",
  r"<p>Pour \(1\leq k\leq n\) : \(\frac n{n^2+n}\leq\frac n{n^2+k}\leq\frac n{n^2+1}\). En sommant : \(\frac1{1+\frac1n}\leq u_n\leq\frac1{1+\frac1{n^2}}\). Les deux bornes tendent vers 1 : par les gendarmes, \(u_n\to1\).</p>")
q(CH4, P, 'exercice', "Encadrer avec cos et sin",
  r"<p>Déterminer les limites de \(u_n=\frac{n+2\cos n}{n+1}\) et \(v_n=n+\sin n\).</p>",
  r"<p>\(|u_n-1|=\frac{|2\cos n-1|}{n+1}\leq\frac3{n+1}\to0\), donc \(u_n\to1\). \(v_n\geq n-1\to+\infty\), donc \(v_n\to+\infty\) (IV-9).</p>")

# ---------------- Cartes mémo ----------------
C = []
def c(ch, partie, recto, verso): C.append((ch, partie, recto, verso))
for (ch, partie, typ, titre, en, co) in Q:
    if typ == 'cours': c(ch, partie, en, co)
c(CH2, 'Suites particulières : arithmétiques, géométriques, récurrentes', r"<p>Somme \(1+2+\dots+n\) ?</p>", r"<p>\(\dfrac{n(n+1)}2\)</p>")
c(CH2, 'Suites particulières : arithmétiques, géométriques, récurrentes', r"<p>Somme des termes d'une suite arithmétique ?</p>", r"<p>Nombre de termes \(\times\) moyenne du premier et du dernier : \((k+1)\dfrac{u_{n_0}+u_{n_0+k}}2\).</p>")
c(CH2, 'Fonctions : propriétés, continuité, dérivation', r"<p>Équation de la tangente en \(a\) ?</p>", r"<p>\(y=f'(a)(x-a)+f(a)\)</p>")
c(CH2, 'Fonctions : propriétés, continuité, dérivation', r"<p>Dérivées de \(u^n\), \(\frac1u\), \(\frac uv\), \(e^u\), \(\ln u\) ?</p>", r"<p>\(nu'u^{n-1}\), \(-\frac{u'}{u^2}\), \(\frac{u'v-uv'}{v^2}\), \(u'e^u\), \(\frac{u'}u\)</p>")
c(CH2, 'Exponentielle, logarithme, puissances', r"<p>Inégalités de convexité de \(\exp\) et \(\ln\) ?</p>", r"<p>\(e^x\geq1+x\) pour tout \(x\) ; \(\ln x\leq x-1\) pour \(x>0\) ; égalité en \(x=0\) (resp. \(x=1\)).</p>")
c(CH2, 'Exponentielle, logarithme, puissances', r"<p>\(\lim\limits_{x\to0}\frac{e^x-1}x\) et \(\lim\limits_{t\to0}\frac{\ln(1+t)}t\) ?</p>", r"<p>Les deux valent 1.</p>")
c(CH2, 'Exponentielle, logarithme, puissances', r"<p>Définition de \(x^\alpha\) et sa dérivée ?</p>", r"<p>\(x^\alpha=e^{\alpha\ln x}\) pour \(x>0\) ; \((x^\alpha)'=\alpha x^{\alpha-1}\).</p>")
c(CH3, 'Calcul matriciel', r"<p>\(E_{ij}E_{kl}\) = ?</p>", r"<p>\(\delta_{jk}E_{il}\) : \(E_{il}\) si \(j=k\), la matrice nulle sinon.</p>")
c(CH3, 'Matrices inversibles et puissances', r"<p>Inverse d'un produit \((AB)^{-1}\) ?</p>", r"<p>\(B^{-1}A^{-1}\) (l'ordre s'inverse).</p>")
c(CH3, 'Matrices inversibles et puissances', r"<p>Si \(P^{-1}AP=D\), que vaut \(A^n\) ?</p>", r"<p>\(A^n=PD^nP^{-1}\), et \(D^n\) s'obtient en élevant les coefficients diagonaux à la puissance \(n\).</p>")
c(CH3, 'Vect et familles génératrices', r"<p>Méthode pour écrire \(F\) (défini par des équations) sous forme de Vect ?</p>", r"<p>Résoudre : exprimer des inconnues en fonction des inconnues libres, écrire le vecteur général, le séparer selon chaque inconnue libre. Autant d'inconnues libres que de générateurs.</p>")
c(CH4, 'Convergence : définition, unicité, limites infinies', r"<p>Nier « \(u\) converge vers \(\ell\) » ?</p>", r"<p>\(\exists\varepsilon>0,\ \forall n_0,\ \exists n\geq n_0,\ |u_n-\ell|\geq\varepsilon\)</p>")
c(CH4, 'Propriétés et opérations sur les limites', r"<p>Les quatre formes indéterminées ?</p>", r"<p>\(\infty-\infty\), \(0\times\infty\), \(\frac\infty\infty\), \(\frac00\)</p>")
c(CH4, 'Propriétés et opérations sur les limites', r"<p>\(\frac{\ell}{0^+}\) avec \(\ell>0\) ? Et \(\frac{\ell}{0^-}\) ?</p>", r"<p>\(+\infty\) ; \(-\infty\). Ce n'est pas une forme indéterminée.</p>")
c(CH4, 'Encadrement et comparaison', r"<p>Version pratique pour montrer \(u_n\to\ell\) ?</p>", r"<p>Trouver \(w_n\to0\) telle que \(|u_n-\ell|\leq w_n\) à partir d'un certain rang.</p>")

def lit(s): return "$q$" + s + "$q$"
DUREE = {'cours': 3, 'demo': 5, 'exercice': 7}
lines = ["delete from public.questions;", "delete from public.cartes;"]
for i, (ch, partie, typ, titre, en, co) in enumerate(Q):
    lines.append(f"insert into public.questions(chapitre, partie, type, titre, enonce, corrige, duree_min, ordre) values ({lit(ch)}, {lit(partie)}, '{typ}', {lit(titre)}, {lit(en)}, {lit(co)}, {DUREE[typ]}, {i});")
for i, (ch, partie, r, v) in enumerate(C):
    lines.append(f"insert into public.cartes(chapitre, partie, recto, verso, ordre) values ({lit(ch)}, {lit(partie)}, {lit(r)}, {lit(v)}, {i});")
import os
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'seed.sql'), 'w', encoding='utf8').write("\n".join(lines) + "\n")
from collections import Counter
print(len(Q), 'questions', len(C), 'cartes', Counter((p, t) for _, p, t, *_ in Q).most_common(3))
for p in sorted(set((ch, pa) for ch, pa, *_ in Q)):
    print(p, Counter(t for ch, pa, t, *_ in Q if (ch, pa) == p))
