/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

interface Flashcard {
  term: string;
  definition: string;
}

interface HskDataRow {
  hanza: string;
  pinyin: string;
  english: string;
  hsk: string;
  id: number;
}

// DOM Elements
const flashcardViewer = document.getElementById('flashcardViewer') as HTMLDivElement;
const errorMessage = document.getElementById('errorMessage') as HTMLDivElement;
const hskFilterButtons = document.querySelectorAll('.hsk-filter-button') as NodeListOf<HTMLButtonElement>;
const prevButton = document.getElementById('prevButton') as HTMLButtonElement;
const nextButton = document.getElementById('nextButton') as HTMLButtonElement;
const shuffleButton = document.getElementById('shuffleButton') as HTMLButtonElement;
const cardCounter = document.getElementById('cardCounter') as HTMLSpanElement;
const navigationControls = document.getElementById('navigationControls') as HTMLDivElement;
const themeToggleButton = document.getElementById('themeToggleButton') as HTMLButtonElement;


// State
let allHskData: HskDataRow[] = [];
let currentDeck: HskDataRow[] = [];
let currentIndex = 0;
let isAnimating = false; // Prevent multiple navigations during animation
let touchStartX = 0;
let currentTranslateX = 0;
let isDragging = false;
const swipeThreshold = 50; // Min px distance for a swipe

// Embed the CSV data directly in the code
const csvData = `Hanza,Pinyin,English,HSK Level
大,dà,big,HSK 1
多,duō,many,HSK 1
高兴,gāoxìng,happy,HSK 1
好,hǎo,good,HSK 1
冷,lěng,cold,HSK 1
漂亮,piàoliang,pretty,HSK 1
热,rè,hot,HSK 1
少,shǎo,few,HSK 1
小,xiǎo,small,HSK 1
不,bù,"no, not",HSK 1
没有,méiyǒu,did not,HSK 1
很,hěn,very,HSK 1
太,tài,too,HSK 1
都,dōu,all,HSK 1
会,huì,"can, know to",HSK 1
能,néng,"can, be able to",HSK 1
想,xiǎng,would like to,HSK 1
和,hé,and,HSK 1
这,zhè,this,HSK 1
那,nà,that,HSK 1
喂,wèi,"hey, hello",HSK 1
多少,duōshǎo,how much,HSK 1
几,jǐ,"how many, a few",HSK 1
哪,nǎ,which,HSK 1
哪儿,nǎr,where,HSK 1
什么,shénme,"what, why",HSK 1
谁,shéi,who,HSK 1
怎么,zěnme,how,HSK 1
怎么样,zěnmeyàng,how about,HSK 1
本,běn,[measure word for books],HSK 1
个,gè,[measure word for people],HSK 1
块,kuài,[measure word for pieces],HSK 1
岁,suì,years old,HSK 1
些,xiē,some,HSK 1
一点儿,yīdiǎnr,a little,HSK 1
爸爸,bàba,dad,HSK 1
北京,Běijīng,Beijing,HSK 1
杯子,bēizi,cup,HSK 1
菜,cài,vegetable,HSK 1
茶,chá,tea,HSK 1
出租车,chūzūchē,taxi,HSK 1
点,diǎn,"point, dot, spot",HSK 1
电脑,diànnǎo,computer,HSK 1
电视,diànshì,television,HSK 1
电影,diànyǐng,movie,HSK 1
东西,dōngxi,thing,HSK 1
儿子,érzi,son,HSK 1
饭店,fàndiàn,restaurant,HSK 1
飞机,fēijī,airplane,HSK 1
分钟,fēnzhōng,minute,HSK 1
狗,gǒu,dog,HSK 1
汉语,hànyǔ,mandarin Chinese,HSK 1
后面,hòumiàn,behind,HSK 1
家,jiā,home,HSK 1
今天,jīntiān,today,HSK 1
老师,lǎoshī,teacher,HSK 1
里面,lǐmiàn,inside,HSK 1
妈妈,māma,mom,HSK 1
猫,māo,cat,HSK 1
米饭,mǐfàn,rice,HSK 1
明天,míngtiān,tomorrow,HSK 1
名字,míngzi,name,HSK 1
年,nián,year,HSK 1
女儿,nǚ'ér,daughter,HSK 1
朋友,péngyou,friend,HSK 1
苹果,píngguǒ,apple,HSK 1
钱,qián,money,HSK 1
前面,qiánmiàn,front,HSK 1
人,rén,person,HSK 1
上,shàng,up,HSK 1
商店,shāngdiàn,store,HSK 1
上午,shàngwǔ,morning,HSK 1
时候,shíhou,time,HSK 1
书,shū,book,HSK 1
水,shuǐ,water,HSK 1
水果,shuǐguǒ,fruit,HSK 1
天气,tiānqì,weather,HSK 1
同学,tóngxué,shoolmate,HSK 1
下,xià,down,HSK 1
先生,xiānsheng,sir,HSK 1
现在,xiànzài,now,HSK 1
小姐,xiǎojiě,Miss,HSK 1
下午,xiàwǔ,afternoon,HSK 1
星期,xīngqī,week,HSK 1
学生,xuéshēng,student,HSK 1
学校,xuéxiào,school,HSK 1
衣服,yīfu,cloth,HSK 1
医生,yīshēng,doctor,HSK 1
医院,yīyuàn,hospital,HSK 1
椅子,yǐzi,chair,HSK 1
月,yuè,month,HSK 1
中国,Zhōngguó,China,HSK 1
中午,zhōngwǔ,noon,HSK 1
桌子,zhuōzi,desk,HSK 1
字,zì,character,HSK 1
昨天,zuótiān,yesterday,HSK 1
一,yī,one,HSK 1
二,èr,two,HSK 1
三,sān,three,HSK 1
四,sì,four,HSK 1
五,wǔ,five,HSK 1
六,liù,six,HSK 1
七,qī,seven,HSK 1
八,bā,eight,HSK 1
九,jiǔ,nine,HSK 1
十,shí,ten,HSK 1
号,hào,"[day number in a date], number (in a series)",HSK 1
的,de,[structural particle],HSK 1
了,le,[aspectual particle],HSK 1
吗,ma,[question particle],HSK 1
呢,ne,[question particle],HSK 1
你,nǐ,you,HSK 1
他,tā,"he, him",HSK 1
她,tā,"she, her",HSK 1
我,wǒ,"I, me",HSK 1
我们,wǒmen,"we, us",HSK 1
不客气,búkèqì,you are welcome,HSK 1
打电话,dǎ diànhuà,to call on the phone,HSK 1
没关系,méi guānxì,it doesn’t matter,HSK 1
在,zài,"in, at",HSK 1
爱,ài,to love,HSK 1
吃,chī,to eat,HSK 1
读,dú,to read,HSK 1
对不起,duìbùqǐ,sorry,HSK 1
工作,gōngzuò,to work,HSK 1
喝,hē,to drink,HSK 1
回,huí,to return,HSK 1
叫,jiào,"to call, to be called",HSK 1
开,kāi,to open,HSK 1
看,kàn,to look (at),HSK 1
看见,kànjiàn,to see,HSK 1
来,lái,to come,HSK 1
没有,méiyǒu,to not have,HSK 1
买,mǎi,to buy,HSK 1
请,qǐng,please,HSK 1
去,qù,to go,HSK 1
认识,rènshi,to be familiar with,HSK 1
是,shì,"to be (am, is, are)",HSK 1
睡觉,shuìjiào,to sleep,HSK 1
说,shuō,to say. to speak,HSK 1
听,tīng,to listen (to),HSK 1
下雨,xiàyǔ,to rain,HSK 1
写,xiě,to write,HSK 1
谢谢,xièxie,thank you; to thank,HSK 1
喜欢,xǐhuān,to like,HSK 1
学习,xuéxí,to study,HSK 1
有,yǒu,to have,HSK 1
再见,zàijiàn,good-bye,HSK 1
住,zhù,to live (in/at),HSK 1
做,zuò,to do,HSK 1
坐,zuò,to sit,HSK 1
白,bái,white,HSK 2
长,cháng,long,HSK 2
对,duì,correct,HSK 2
高,gāo,"tall, high",HSK 2
贵,guì,expensive; noble,HSK 2
好吃,hǎochī,"tasty, delicious",HSK 2
黑,hēi,"black; dark; shady, illegal",HSK 2
红,hóng,red; popular; revolutionary,HSK 2
近,jìn,"nearby, close",HSK 2
快,kuài,quick,HSK 2
快乐,kuàilè,happy,HSK 2
累,lèi,tired,HSK 2
慢,màn,slow,HSK 2
忙,máng,busy,HSK 2
便宜,piányi,"cheap, inexpensive",HSK 2
新,xīn,new,HSK 2
远,yuǎn,far,HSK 2
别,bié,do not (do something),HSK 2
非常,fēicháng,"very, extremely",HSK 2
还,hái,still; in addition; even,HSK 2
就,jiù,just (emphasis); only,HSK 2
也,yě,also,HSK 2
已经,yǐjīng,already,HSK 2
一起,yīqǐ,together,HSK 2
再,zài,again; another; then,HSK 2
真,zhēn,"really, truly; real",HSK 2
正在,zhèngzài,in the process of (doing something),HSK 2
最,zuì,"most, -est",HSK 2
可能,kěnéng,"maybe, might; possible",HSK 2
可以,kěyǐ,"may, can",HSK 2
要,yào,to want; to need; have to; want to; will,HSK 2
但是,dànshì,but,HSK 2
虽然,suīrán,although,HSK 2
所以,suǒyǐ,"so, therefore",HSK 2
因为,yīnwèi,because,HSK 2
每,měi,every,HSK 2
为什么,wèishénme,why,HSK 2
次,cì,[measure word for how many times something happens],HSK 2
件,jiàn,[measure word],HSK 2
一下,yīxià,"[after a verb] quickly, briefly, casually",HSK 2
报纸,bàozhǐ,newspaper,HSK 2
宾馆,bīnguǎn,hotel,HSK 2
错,cuò,"mistake, fault; mistakenly",HSK 2
弟弟,dìdi,younger brother,HSK 2
房间,fángjiān,room,HSK 2
服务员,fúwùyuán,"(food) server, waiter, waitress",HSK 2
哥哥,gēge,older brother,HSK 2
公共汽车,gōnggòng qìchē,public (city) bus,HSK 2
公司,gōngsī,"company, corporation; office",HSK 2
孩子,háizi,child,HSK 2
火车站,huǒchēzhàn,train station,HSK 2
教室,jiàoshì,classroom,HSK 2
机场,jīchǎng,airport,HSK 2
鸡蛋,jīdàn,(chicken) egg,HSK 2
姐姐,jiějie,older sister,HSK 2
咖啡,kāfēi,coffee,HSK 2
考试,kǎoshì,"test, exam",HSK 2
课,kè,"lesson, class",HSK 2
路,lù,"road, path, way",HSK 2
旅游,lǚyóu,travel,HSK 2
妹妹,mèimei,younger sister; young woman,HSK 2
门,mén,"door, gate",HSK 2
面条,miàntiáo,noodles,HSK 2
男,nán,male,HSK 2
牛奶,niúnǎi,(cow) milk,HSK 2
女,nǚ,female,HSK 2
旁边,pángbiān,"the side, next to",HSK 2
票,piào,ticket,HSK 2
铅笔,qiānbǐ,pencil,HSK 2
晴,qíng,"clear, fine (weather)",HSK 2
妻子,qīzi,wife,HSK 2
去年,qùnián,last year,HSK 2
日,rì,day; Japan,HSK 2
生日,shēngrì,birthday,HSK 2
身体,shēntǐ,body; health,HSK 2
时间,shíjiān,time,HSK 2
事情,shìqing,"affair, business, matter, thing",HSK 2
手表,shǒubiǎo,wristwatch,HSK 2
手机,shǒujī,"cell phone, mobile phone",HSK 2
题,tí,(math) problem,HSK 2
外,wài,outside,HSK 2
问题,wèntí,"question; problem, issue",HSK 2
洗,xǐ,"to wash, to bathe",HSK 2
小时,xiǎoshí,hour,HSK 2
西瓜,xīguā,watermelon,HSK 2
姓,xìng,surname,HSK 2
希望,xīwàng,"to hope, to wish",HSK 2
雪,xuě,snow,HSK 2
羊肉,yángròu,"mutton, lamb (meat)",HSK 2
眼睛,yǎnjing,eye,HSK 2
颜色,yánsè,color,HSK 2
药,yào,"medicine, drug",HSK 2
阴,yīn,overcast (in 阴天),HSK 2
意思,yìsi,meaning,HSK 2
游泳,yóuyǒng,swimming,HSK 2
右边,yòubian,right side; to the right,HSK 2
鱼,yú,fish,HSK 2
运动,yùndòng,"sports, exercise",HSK 2
早上,zǎoshang,morning,HSK 2
丈夫,zhàngfu,husband,HSK 2
准备,zhǔnbèi,preparation(s),HSK 2
左边,zuǒbian,the left side; to the left of,HSK 2
百,bǎi,hundred,HSK 2
第一,dì-yī,"number one, the first",HSK 2
两,liǎng,two (of something),HSK 2
千,qiān,thousand,HSK 2
吧,ba,[modal particle for suggestions],HSK 2
得,de,[structural particle used after a verb],HSK 2
过,guo,[aspectual particle to indicate experience],HSK 2
着,zhe,[aspectual particle indicating a continuous state],HSK 2
大家,dàjiā,everyone,HSK 2
您,nín,you (polite form),HSK 2
它,tā,it,HSK 2
打篮球,dǎ lánqiú,to play basketball,HSK 2
踢足球,tī zúqiú,to play soccer,HSK 2
比,bǐ,"to compare, to compete; [particle for comparisons]",HSK 2
从,cóng,from; via,HSK 2
对,duì,toward,HSK 2
给,gěi,"to, for",HSK 2
往,wǎng,towards,HSK 2
帮助,bāngzhù,help; to help,HSK 2
唱歌,chànggē,to sing a song,HSK 2
出,chū,to go out; to happen,HSK 2
穿,chuān,"to wear, to put on; to pierce",HSK 2
到,dào,"to arrive; to (a place), until (a time)",HSK 2
等,děng,to wait (for),HSK 2
懂,dǒng,to understand,HSK 2
告诉,gàosu,"to tell, to inform",HSK 2
给,gěi,to give,HSK 2
介绍,jièshào,to introduce,HSK 2
进,jìn,"to enter, to go in",HSK 2
觉得,juéde,to think; to feel,HSK 2
开始,kāishǐ,to start; beginning,HSK 2
离,lí,to be distanced from,HSK 2
旅游,lǚyóu,to travel,HSK 2
卖,mài,to sell,HSK 2
跑步,pǎobù,"to jog, to go running",HSK 2
起床,qǐchuáng,to get up (out of bed),HSK 2
让,ràng,"to let, to make, to have (someone do something)",HSK 2
上班,shàngbān,to go to work,HSK 2
生病,shēngbìng,"to fall ill, to get sick",HSK 2
说话,shuōhuà,"to speak (words), to talk",HSK 2
送,sòng,"to give (a gift); to deliver, to send; to see off (a person)",HSK 2
跳舞,tiàowǔ,to dance (a dance),HSK 2
完,wán,to finish,HSK 2
玩,wán,to play (with); to have fun,HSK 2
晚上,wǎnshang,evening,HSK 2
问,wèn,to ask,HSK 2
笑,xiào,"to laugh, to smile",HSK 2
姓,xìng,to be surnamed,HSK 2
休息,xiūxi,"to rest, to sleep",HSK 2
游泳,yóuyǒng,to swim,HSK 2
运动,yùndòng,"to exercise, to play sports",HSK 2
找,zhǎo,to look for; to call on someone,HSK 2
知道,zhīdào,to know,HSK 2
准备,zhǔnbèi,to prepare,HSK 2
走,zǒu,"to walk, to go, to leave",HSK 2
矮,ǎi,short,HSK 3
安静,ānjìng,quiet,HSK 3
饱,bǎo,full (from eating),HSK 3
聪明,cōngming,"smart, intelligent",HSK 3
低,dī,low,HSK 3
短,duǎn,short,HSK 3
饿,è,to be hungry; hungry,HSK 3
方便,fāngbiàn,convenient,HSK 3
干净,gānjìng,"clean, neat",HSK 3
高兴,gāoxìng,happy,HSK 3
坏,huài,bad; spoiled; broken; to break (down),HSK 3
黄,huáng,yellow,HSK 3
简单,jiǎndān,simple,HSK 3
健康,jiànkāng,healthy; health,HSK 3
久,jiǔ,long (time),HSK 3
旧,jiù,old and worn out,HSK 3
渴,kě,thirsty,HSK 3
可爱,kě'ài,"lovable, cute",HSK 3
蓝,lán,blue,HSK 3
老,lǎo,old,HSK 3
绿,lǜ,green,HSK 3
难,nán,difficult,HSK 3
难过,nánguò,to feel upset,HSK 3
年轻,niánqīng,youthful,HSK 3
努力,nǔlì,"to try hard, to strive",HSK 3
胖,pàng,"fat, chubby",HSK 3
便宜,piányi,"cheap, inexpensive",HSK 3
奇怪,qíguài,"strange, odd; to be baffled",HSK 3
清楚,qīngchu,clear,HSK 3
认真,rènzhēn,serious; seriously,HSK 3
热情,rèqíng,"enthusiastic, passionate, super friendly",HSK 3
容易,róngyì,easy,HSK 3
瘦,shòu,thin,HSK 3
舒服,shūfu,comfortable; pleasant-feeling; feeling well,HSK 3
甜,tián,sweet,HSK 3
突然,tūrán,sudden; suddenly,HSK 3
小心,xiǎoxīn,to be careful,HSK 3
新鲜,xīnxiān,fresh,HSK 3
一般,yībān,in general; average,HSK 3
一样,yīyàng,the same (as),HSK 3
有名,yǒumíng,"famous, well-known",HSK 3
着急,zháojí,to be anxious,HSK 3
真,zhēn,"really, truly; real",HSK 3
重要,zhòngyào,important,HSK 3
主要,zhǔyào,main; mainly,HSK 3
比较,bǐjiào,to compare; comparatively,HSK 3
必须,bìxū,must,HSK 3
才,cái,only; just now; not until...,HSK 3
当然,dāngrán,"of course, naturally",HSK 3
多么,duōme,how (wonderful etc)/what (a great idea etc),HSK 3
更,gèng,even more,HSK 3
极,jí,extremely,HSK 3
几乎,jīhū,"almost, nearly",HSK 3
经常,jīngcháng,often,HSK 3
马上,mǎshàng,right away; on horseback,HSK 3
其实,qíshí,"actually, in fact",HSK 3
特别,tèbié,special,HSK 3
先,xiān,"first, in advance",HSK 3
一定,yīdìng,definitely,HSK 3
一共,yīgòng,altogether,HSK 3
一直,yīzhí,continuously; straight (forward),HSK 3
又,yòu,(once) again,HSK 3
越,yuè,to surpass; the more...,HSK 3
真,zhēn,"really, truly; real",HSK 3
只,zhǐ,only,HSK 3
终于,zhōngyú,at last; in the end; finally; eventually,HSK 3
总是,zǒngshì,always,HSK 3
应该,yīnggāi,"should, ought to",HSK 3
愿意,yuànyì,to be willing,HSK 3
不但,bùdàn,not only (... but also...),HSK 3
而且,érqiě,"in addition, furthermore",HSK 3
还是,háishì,or; still,HSK 3
或者,huòzhě,or [in statements],HSK 3
然后,ránhòu,and then,HSK 3
如果,rúguǒ,if,HSK 3
虽然,suīrán,although,HSK 3
一边,yībiān,one side; while doing...,HSK 3
只有,zhǐyǒu,only (if),HSK 3
那么,nàme,"like that, in that way; in that case",HSK 3
其他,qítā,other,HSK 3
这么,zhème,"so much, this much",HSK 3
把,bǎ,[measure word for things with a handle],HSK 3
层,céng,"[measure word for floor, level of a building]",HSK 3
段,duàn,"[measure word for length (of time), paragraph]",HSK 3
分,fēn,a unit of money (equal to 1/100 yuan),HSK 3
公斤,gōngjīn,kilogram (kg),HSK 3
角,jiǎo,unit of money (equal to 1/10 yuan),HSK 3
刻,kè,quarter (hour),HSK 3
口,kǒu,[measure word for bites of food or people in a household],HSK 3
辆,liàng,[measure word for cars],HSK 3
双,shuāng,"pair, [measure word for pairs of things]",HSK 3
条,tiáo,[measure word for long things],HSK 3
碗,wǎn,[measure word for bowls of something],HSK 3
位,wèi,[polite measure word for people],HSK 3
元,yuán,[measure word for units of money],HSK 3
张,zhāng,[measure word for flat things],HSK 3
只,zhī,[measure word for small things],HSK 3
种,zhǒng,"kind, type",HSK 3
爱好,àihào,hobby,HSK 3
阿姨,āyí,maternal aunt; housekeeper,HSK 3
班,bān,"class, team; work",HSK 3
办法,bànfǎ,"way of doing, method",HSK 3
办公室,bàngōngshì,office,HSK 3
包,bāo,bag,HSK 3
报纸,bàozhǐ,newspaper,HSK 3
北,běi,north,HSK 3
北方,běifāng,the north,HSK 3
杯子,bēizi,"cup, glass",HSK 3
变化,biànhuà,change,HSK 3
表演,biǎoyǎn,"play, show, performance",HSK 3
别人,biérén,other people,HSK 3
笔记本,bǐjìběn,notebook,HSK 3
宾馆,bīnguǎn,hotel,HSK 3
冰箱,bīngxiāng,"refrigerator (lit. ""ice box"")",HSK 3
比赛,bǐsài,"competition (sports, etc.)",HSK 3
鼻子,bízi,nose,HSK 3
菜,cài,vegetable; dish (of food); cuisine (of a region),HSK 3
菜单,càidān,menu,HSK 3
船,chuán,"boat, ship",HSK 3
草,cǎo,grass,HSK 3
超市,chāoshì,supermarket,HSK 3
成绩,chéngjì,achievement; grades,HSK 3
城市,chéngshì,city,HSK 3
衬衫,chènshān,dress shirt,HSK 3
厨房,chúfáng,kitchen,HSK 3
春,chūn,spring,HSK 3
出租车,chūzūchē,taxi,HSK 3
词典,cídiǎn,dictionary (of words),HSK 3
词语,cíyǔ,"word, expression",HSK 3
蛋糕,dàngāo,cake,HSK 3
打算,dǎsuàn,plan,HSK 3
灯,dēng,"light, lamp",HSK 3
电脑,diànnǎo,computer,HSK 3
电视,diànshì,"television, TV",HSK 3
电梯,diàntī,elevator; escalator,HSK 3
电影,diànyǐng,"movie, film",HSK 3
电子邮件,diànzǐ yóujiàn,"email (lit. ""electronic mail"")",HSK 3
地方,dìfang,place,HSK 3
地铁,dìtiě,"subway, metro",HSK 3
地图,dìtú,map,HSK 3
东,dōng,east,HSK 3
冬,dōng,winter,HSK 3
动物,dòngwù,animal,HSK 3
东西,dōngxi,thing,HSK 3
耳朵,ěrduo,ear,HSK 3
飞机,fēijī,airplane,HSK 3
附近,fùjìn,"nearby, (in the) vicinity",HSK 3
刚才,gāngcái,(just) a moment ago,HSK 3
个子,gèzi,"height, stature",HSK 3
公园,gōngyuán,public park,HSK 3
狗,gǒu,dog,HSK 3
关系,guānxi,"relation, relationship; to concern",HSK 3
国家,guójiā,"country, nation",HSK 3
过去,guòqù,(in the) past; to go over (to a place),HSK 3
果汁,guǒzhī,fruit juice,HSK 3
故事,gùshi,story,HSK 3
河,hé,river,HSK 3
黑板,hēibǎn,blackboard,HSK 3
后来,hòulái,afterwards; later,HSK 3
花,huā,flower,HSK 3
画,huà,"picture, painting",HSK 3
黄河,HuángHé,"Yellow River, Huang He",HSK 3
环境,huánjìng,"environment, circumstances, surroundings",HSK 3
花园,huāyuán,(flower) garden,HSK 3
会议,huìyì,meeting,HSK 3
护照,hùzhào,passport,HSK 3
脚,jiǎo,"foot, leg",HSK 3
街道,jiēdào,street,HSK 3
节目,jiémù,program,HSK 3
节日,jiérì,"holiday, festival",HSK 3
机会,jīhuì,opportunity,HSK 3
季节,jìjié,"season, time",HSK 3
经理,jīnglǐ,manager,HSK 3
句子,jùzi,sentence,HSK 3
客人,kèrén,"visitor, guest, customer, client",HSK 3
空调,kōngtiáo,air conditioning,HSK 3
口,kǒu,mouth,HSK 3
筷子,kuàizi,chopsticks,HSK 3
裤子,kùzi,long pants,HSK 3
脸,liǎn,face,HSK 3
练习,liànxí,"practice, a (language) exercise",HSK 3
邻居,línjū,neighbor,HSK 3
历史,lìshǐ,history,HSK 3
礼物,lǐwù,"gift, present",HSK 3
楼,lóu,building; floor (of a building),HSK 3
路,lù,"road, path, way",HSK 3
马,mǎ,horse,HSK 3
猫,māo,cat,HSK 3
帽子,màozi,"hat, cap, hood (of a jacket)",HSK 3
门,mén,"door, gate",HSK 3
米,mǐ,(uncooked) rice; meter,HSK 3
面包,miànbāo,bread,HSK 3
面条,miàntiáo,noodles,HSK 3
奶奶,nǎinai,paternal grandmother,HSK 3
南,nán,south,HSK 3
年级,niánjí,grade (in school),HSK 3
鸟,niǎo,bird,HSK 3
盘子,pánzi,"plate, dish, tray",HSK 3
票,piào,ticket,HSK 3
啤酒,píjiǔ,beer,HSK 3
瓶子,píngzi,bottle,HSK 3
皮鞋,píxié,leather shoes,HSK 3
葡萄,pútao,grape(s),HSK 3
普通话,pǔtōnghuà,"Mandarin (lit. ""common speech"")",HSK 3
钱,qián,money,HSK 3
铅笔,qiānbǐ,pencil,HSK 3
秋,qiū,autumn,HSK 3
裙子,qúnzi,"dress, skirt",HSK 3
伞,sǎn,"umbrella, parasol",HSK 3
声音,shēngyīn,"sound, voice",HSK 3
世界,shìjiè,world,HSK 3
手机,shǒujī,"cell phone, mobile phone",HSK 3
书,shū,book,HSK 3
树,shù,tree,HSK 3
水平,shuǐpíng,"level (of ability, etc.)",HSK 3
叔叔,shūshu,"uncle, father's younger brother",HSK 3
数学,shùxué,mathematics,HSK 3
司机,sījī,driver,HSK 3
太阳,tàiyáng,sun,HSK 3
糖,táng,sugar; candy,HSK 3
天气,tiānqì,weather,HSK 3
体育,tǐyù,"physical education, sports",HSK 3
同事,tóngshì,"co-worker, colleague",HSK 3
头发,tóufa,hair (on the head),HSK 3
腿,tuǐ,leg,HSK 3
图书馆,túshūguǎn,library,HSK 3
碗,wǎn,bowl,HSK 3
文化,wénhuà,culture,HSK 3
问题,wèntí,"question; problem, issue",HSK 3
西,xī,west,HSK 3
夏,xià,summer,HSK 3
香蕉,xiāngjiāo,banana,HSK 3
先生,xiānsheng,Mr.; husband; sir,HSK 3
校长,xiàozhǎng,principal,HSK 3
习惯,xíguàn,"habit, custom",HSK 3
信,xìn,letter; to believe,HSK 3
行李箱,xínglixiāng,"trunk (of a car), baggage compartment",HSK 3
兴趣,xìngqù,interest (in something),HSK 3
新闻,xīnwén,news,HSK 3
信用卡,xìnyòngkǎ,credit card,HSK 3
熊猫,xíongmāo,panda,HSK 3
洗手间,xǐshǒujiān,restroom,HSK 3
选择,xuǎnzé,choice,HSK 3
雪,xuě,snow,HSK 3
眼镜,yǎnjìng,glasses,HSK 3
眼睛,yǎnjing,eye,HSK 3
要求,yāoqiú,demand(s),HSK 3
爷爷,yéye,paternal grandfather,HSK 3
衣服,yīfu,clothing,HSK 3
以后,yǐhòu,"after, later on, in the future",HSK 3
一会儿,yīhuìr,a while,HSK 3
影响,yǐngxiǎng,an influence,HSK 3
银行,yínháng,bank,HSK 3
饮料,yǐnliào,"beverage, (non-alcoholic) drink",HSK 3
音乐,yīnyuè,music,HSK 3
以前,yǐqián,"before, previous; ago",HSK 3
游戏,yóuxì,game,HSK 3
鱼,yú,fish,HSK 3
月亮,yuèliang,the moon,HSK 3
照片,zhàopiàn,photograph,HSK 3
照相机,zhàoxiàngjī,camera,HSK 3
中间,zhōngjiān,in the middle,HSK 3
中文,Zhōngwén,Chinese (language),HSK 3
周末,zhōumò,weekend,HSK 3
字典,zìdiǎn,character dictionary,HSK 3
自行车,zìxíngchē,bicycle,HSK 3
嘴,zuǐ,mouth,HSK 3
最后,zuìhòu,last,HSK 3
最近,zuìjìn,"recently, these days",HSK 3
作业,zuòyè,homework,HSK 3
作用,zuòyòng,impact,HSK 3
半,bàn,half,HSK 3
万,wàn,ten thousand,HSK 3
地,de,[structural particle used before a verb or adjective],HSK 3
啊,a,[sentence-final modal particle],HSK 3
自己,zìjǐ,oneself,HSK 3
感兴趣,gǎn xìngqù,to be interested in,HSK 3
被,bèi,[passive marker],HSK 3
除了,chúle,except for,HSK 3
跟,gēn,"and, with",HSK 3
根据,gēnjù,"according to, based on",HSK 3
关于,guānyú,"about, concerning, regarding",HSK 3
为,wèi,for; to,HSK 3
为了,wèile,"for the purpose of, in order to",HSK 3
向,xiàng,towards,HSK 3
搬,bān,"to move (house, or large heavy objects)",HSK 3
帮忙,bāngmáng,"to help, to do a favor",HSK 3
变化,biànhuà,to change,HSK 3
表示,biǎoshì,"to show, to indicate",HSK 3
表演,biǎoyǎn,"to perform, to act",HSK 3
参加,cānjiā,"to participate in, to attend",HSK 3
差,chà,poor quality; to differ,HSK 3
迟到,chídào,to arrive late,HSK 3
出现,chūxiàn,to appear,HSK 3
带,dài,to carry,HSK 3
担心,dānxīn,to worry,HSK 3
打扫,dǎsǎo,to clean,HSK 3
打算,dǎsuàn,to plan (to),HSK 3
懂,dǒng,to understand,HSK 3
锻炼,duànliàn,"to exercise, to work out, to train a skill",HSK 3
发,fā,to send out,HSK 3
放,fàng,"to put, to place; to release",HSK 3
放心,fàngxīn,to be at ease,HSK 3
发烧,fāshāo,to have a fever,HSK 3
发现,fāxiàn,to find; to discover,HSK 3
分,fēn,"to divide, to separate",HSK 3
复习,fùxí,to review (as part of one's studies),HSK 3
敢,gǎn,to dare (to),HSK 3
感冒,gǎnmào,"to catch cold, to have a cold; a cold",HSK 3
刮风,guāfēng,the wind blows,HSK 3
关,guān,"to close, to shut, to turn off",HSK 3
关心,guānxīn,"to care for, to be concerned about",HSK 3
过,guò,"to spend, to pass",HSK 3
害怕,hàipà,to be afraid; to be scared,HSK 3
花,huā,"to spend (money, time)",HSK 3
画,huà,to draw,HSK 3
还,huán,"to return (money, etc.)",HSK 3
换,huàn,to replace; to exchange,HSK 3
欢迎,huānyíng,to welcome,HSK 3
回答,huídá,"to reply, to answer; the answer",HSK 3
检查,jiǎnchá,"to inspect, to examine",HSK 3
讲,jiǎng,to speak,HSK 3
见面,jiànmiàn,to meet,HSK 3
教,jiāo,to teach,HSK 3
记得,jìde,to remember,HSK 3
接,jiē,"to receive, to pick up",HSK 3
借,jiè,"to lend, to borrow",HSK 3
结婚,jiéhūn,to get married,HSK 3
解决,jiějué,to resolve,HSK 3
结束,jiéshù,to be finished,HSK 3
经过,jīngguò,"to pass, to go through",HSK 3
决定,juédìng,to decide,HSK 3
哭,kū,to cry,HSK 3
练习,liànxí,to practice,HSK 3
离开,líkāi,to leave,HSK 3
了解,liǎojiě,to be fully familiar with,HSK 3
聊天,liáotiān,to chat,HSK 3
留学,liúxué,to study abroad,HSK 3
卖,mài,to sell,HSK 3
满意,mǎnyì,to be satisfied,HSK 3
明白,míngbai,"to understand, to realize",HSK 3
拿,ná,"to get, to pick up",HSK 3
爬山,páshān,"to climb a mountain, to go hiking",HSK 3
骑,qí,"to ride (by straddling, as when riding a horse or bike)",HSK 3
起床,qǐchuáng,to get up (out of bed),HSK 3
起飞,qǐfēi,to take off (in an airplane),HSK 3
起来,qǐlái,to get up; upward,HSK 3
请,qǐng,"to invite, to request, to treat (to a meal, etc.); please",HSK 3
请假,qǐngjià,to ask for leave,HSK 3
认为,rènwéi,to believe; to think,HSK 3
上网,shàngwǎng,"to go online, to use the internet",HSK 3
生气,shēngqì,to get angry,HSK 3
使,shǐ,"to make, to cause",HSK 3
试,shì,to try,HSK 3
刷牙,shuāyá,to brush one's teeth,HSK 3
疼,téng,"to hurt, to be sore; to love dearly",HSK 3
提高,tígāo,to raise; to improve,HSK 3
同意,tóngyì,to agree,HSK 3
完成,wánchéng,to complete,HSK 3
忘记,wàngjì,to forget,HSK 3
像,xiàng,to resemble; like,HSK 3
相信,xiāngxìn,to believe (that),HSK 3
洗澡,xǐzǎo,"to bathe, to take a shower",HSK 3
选择,xuǎnzé,to choose,HSK 3
学习,xuéxí,to learn; to study,HSK 3
需要,xūyào,to need,HSK 3
要求,yāoqiú,to demand,HSK 3
应该,yīnggāi,"ought to, should",HSK 3
以为,yǐwéi,to (mistakenly) think (that),HSK 3
用,yòng,to use,HSK 3
愿意,yuànyì,to be willing (to do sth),HSK 3
遇到,yùdào,"to run into, to come across",HSK 3
再见,zàijiàn,"goodbye, see you later",HSK 3
站,zhàn,"to stand; station, stop",HSK 3
长,zhǎng,to grow,HSK 3
照顾,zhàogu,to take care of,HSK 3
祝,zhù,to wish,HSK 3
注意,zhùyì,to pay attention,HSK 3
安全,ānquán,safe,HSK 4
棒,bàng,great,HSK 4
笨,bèn,stupid,HSK 4
成功,chénggōng,successful,HSK 4
诚实,chéngshí,honest,HSK 4
粗心,cūxīn,"careless, thoughtless",HSK 4
得意,déyì,proud of oneself; pleased with oneself; complacent,HSK 4
低,dī,low,HSK 4
烦恼,fánnǎo,"annoyances, pains, troubling matters",HSK 4
丰富,fēngfù,abundant,HSK 4
富,fù,rich,HSK 4
复杂,fùzá,"complicated, complex",HSK 4
共同,gòngtóng,"joint, in common",HSK 4
合格,hégé,"qualified, up to standard",HSK 4
合适,héshì,suitable,HSK 4
厚,hòu,"thick, deep",HSK 4
火,huǒ,"popular, hot",HSK 4
活泼,huópo,lively,HSK 4
假,jiǎ,fake,HSK 4
骄傲,jiāoào,proud,HSK 4
激动,jīdòng,excited,HSK 4
积极,jījí,active; positive,HSK 4
精彩,jīngcǎi,"spectacular, wonderful",HSK 4
紧张,jǐnzhāng,"nervous, tense; strained",HSK 4
开心,kāixīn,happy,HSK 4
可怜,kělián,"pitiful, poor",HSK 4
可惜,kěxī,"such a shame, unfortunately",HSK 4
空,kōng,empty,HSK 4
苦,kǔ,"bitter, hardship",HSK 4
困,kùn,sleepy,HSK 4
辣,là,spicy,HSK 4
懒,lǎn,lazy,HSK 4
浪漫,làngmàn,romantic,HSK 4
冷静,lěngjìng,calm; cool-headed,HSK 4
凉快,liángkuai,cool (temperature),HSK 4
厉害,lìhai,"impressive, awesome; tremendous",HSK 4
礼貌,lǐmào,polite,HSK 4
流利,liúlì,fluent,HSK 4
乱,luàn,"chaotic, messy, disorganized",HSK 4
麻烦,máfan,troublesome,HSK 4
马虎,mǎhu,careless,HSK 4
美丽,měilì,beautiful,HSK 4
免费,miǎnfèi,free,HSK 4
难受,nánshòu,to feel unwell;to suffer pain;to be difficult to bear,HSK 4
暖,nuǎn,warm,HSK 4
暖和,nuǎnhuo,warm,HSK 4
破,pò,"worn out, lousy; to break",HSK 4
普遍,pǔbiàn,universal; general; widespread; common,HSK 4
轻,qīng,"light, easy, gentle, soft",HSK 4
轻松,qīngsōng,"gentle, relaxed",HSK 4
穷,qióng,poor,HSK 4
热闹,rènao,bustling with noise and excitement;lively,HSK 4
伤心,shāngxīn,sad,HSK 4
深,shēn,deep,HSK 4
失望,shīwàng,disappointed,HSK 4
帅,shuài,handsome,HSK 4
顺利,shùnlì,smooth; smoothly,HSK 4
死,sǐ,"rigid, inflexible",HSK 4
酸,suān,sour; sore; acid,HSK 4
随便,suíbiàn,as one pleases,HSK 4
所有,suǒyǒu,all,HSK 4
危险,wēixiǎn,dangerous,HSK 4
无聊,wúliáo,boring; bored,HSK 4
咸,xián,salty,HSK 4
香,xiāng,"fragrant, good-smelling",HSK 4
相同,xiāngtóng,"same, identical",HSK 4
详细,xiángxì,detailed,HSK 4
兴奋,xīngfèn,excited,HSK 4
幸福,xìngfú,happy (in the fairytale sense),HSK 4
辛苦,xīnkǔ,"to be a lot of hard work, toilsome",HSK 4
严格,yángé,strict,HSK 4
阳光,yángguāng,sunshine,HSK 4
严重,yánzhòng,serious,HSK 4
勇敢,yǒnggǎn,brave,HSK 4
友好,yǒuhǎo,friendly,HSK 4
幽默,yōumò,humorous,HSK 4
有趣,yǒuqù,"interesting, amusing",HSK 4
优秀,yōuxiù,"outstanding, excellent",HSK 4
原来,yuánlái,"formerly, original",HSK 4
愉快,yúkuài,"pleasant, happy",HSK 4
脏,zāng,dirty,HSK 4
正常,zhèngcháng,normal,HSK 4
正确,zhèngquè,"correct, right",HSK 4
正式,zhèngshì,formal,HSK 4
真正,zhēnzhèng,"real, true",HSK 4
直接,zhíjiē,directly,HSK 4
重,zhòng,"heavy; strong (accent, scent, flavor, etc.)",HSK 4
专业,zhuānyè,professional,HSK 4
著名,zhùmíng,famous,HSK 4
准确,zhǔnquè,"accurate, precise",HSK 4
准时,zhǔnshí,on time; punctual,HSK 4
仔细,zǐxì,careful,HSK 4
自信,zìxìn,to be self-confident,HSK 4
别,bié,do not (do something),HSK 4
按时,ànshí,on time,HSK 4
本来,běnlái,originally,HSK 4
差不多,chàbuduō,"more or less, almost",HSK 4
重新,chóngxīn,all over again,HSK 4
从来,cónglái,always; never (if used in negative sentence),HSK 4
大概,dàgài,roughly; probably; approximate,HSK 4
倒,dào,"yet, actually (used to indicate contrast)",HSK 4
到处,dàochù,everywhere,HSK 4
到底,dàodǐ,after all,HSK 4
大约,dàyuē,approximately; about,HSK 4
刚,gāng,just (did something),HSK 4
光,guāng,"only, merely",HSK 4
故意,gùyì,"on purpose, intentional",HSK 4
好像,hǎoxiàng,to seem like; to seem to be,HSK 4
互相,hùxiāng,mutually,HSK 4
接着,jiēzhe,"to continue doing; next, ...",HSK 4
竟然,jìngrán,unexpectedly,HSK 4
及时,jíshí,in time; promptly,HSK 4
究竟,jiūjìng,"after all, when all is said and done, finally",HSK 4
肯定,kěndìng,certainly,HSK 4
恐怕,kǒngpà,I'm afraid that...,HSK 4
难道,nándào,could it be that...? [rhetorical question marker],HSK 4
偶尔,ǒu'ěr,occasionally,HSK 4
千万,qiānwàn,one must by all means (do something),HSK 4
却,què,"however, yet",HSK 4
确实,quèshí,indeed,HSK 4
仍然,réngrán,"still, yet",HSK 4
稍微,shāowēi,a little bit,HSK 4
十分,shífēn,"very, extremely",HSK 4
是否,shìfǒu,whether or not,HSK 4
实在,shízài,actually,HSK 4
顺便,shùnbiàn,while we're at it...,HSK 4
挺,tǐng,rather; quite,HSK 4
提前,tíqián,in advance,HSK 4
往往,wǎngwǎng,often;frequently,HSK 4
完全,wánquán,completely; totally,HSK 4
也许,yěxǔ,"perhaps, maybe",HSK 4
永远,yǒngyuǎn,"forever, eternal",HSK 4
尤其,yóuqí,especially,HSK 4
正好,zhènghǎo,"just happen to, by chance",HSK 4
只好,zhǐhǎo,"to have to, to have no choice but to",HSK 4
至少,zhìshǎo,at least,HSK 4
专门,zhuānmén,"especially (for), specialized",HSK 4
自然,zìrán,"naturally, certainly",HSK 4
最好,zuìhǎo,(you) had better (do something),HSK 4
得,děi,"must, have to",HSK 4
但是,dànshì,but,HSK 4
并且,bìngqiě,"and besides, moreover",HSK 4
不管,bùguǎn,"no matter (what, how)",HSK 4
不过,bùguò,"but, yet",HSK 4
不仅,bùjǐn,not only (this one);not just (...) but also,HSK 4
而,ér,"but (not), yet (not) [indicates contrast]",HSK 4
否则,fǒuzé,"otherwise, or else",HSK 4
尽管,jǐnguǎn,although,HSK 4
既然,jìrán,"since..., this being the case...",HSK 4
即使,jíshǐ,even if; even though,HSK 4
可是,kěshì,but,HSK 4
另外,lìngwài,in addition,HSK 4
然而,ránér,"however, but",HSK 4
甚至,shènzhì,even,HSK 4
同时,tóngshí,at the same time,HSK 4
无论,wúlùn,regardless of,HSK 4
相反,xiāngfǎn,opposite,HSK 4
要是,yàoshi,if,HSK 4
因此,yīncǐ,"therefore, thus, as a result",HSK 4
由于,yóuyú,since; because,HSK 4
于是,yúshì,thereupon,HSK 4
只要,zhǐyào,if only;so long as,HSK 4
倍,bèi,"times (the amount), -fold",HSK 4
遍,biàn,time(s) [measure word for counting actions from start to finish],HSK 4
场,cháng,[measure word for sports or entertainmnet events],HSK 4
份,fèn,"a portion, a copy, a set [measure word]",HSK 4
公里,gōnglǐ,kilometer,HSK 4
节,jié,"section, length",HSK 4
棵,kē,[measure word for trees or other large plants],HSK 4
秒,miǎo,second (unit of time),HSK 4
篇,piān,[measure word for essays and other written pieces],HSK 4
台,tái,[measure word for computers],HSK 4
趟,tàng,time(s) [measure word used for round trips],HSK 4
页,yè,page,HSK 4
座,zuò,"[measure word for bridges, mountains, buildings]",HSK 4
爱情,àiqíng,love (romantic),HSK 4
安排,ānpái,arrangement,HSK 4
安全,ānquán,safety,HSK 4
包子,bāozi,steamed (stuffed) bun,HSK 4
表格,biǎogé,"form, table",HSK 4
表演,biǎoyǎn,play; show; performance; exhibition; to perform; to act; to demonstrate,HSK 4
标准,biāozhǔn,standard,HSK 4
饼干,bǐnggān,"cracker, cookie",HSK 4
博士,bóshì,Ph.D. (degree); doctor,HSK 4
部分,bùfen,"part, section",HSK 4
材料,cáiliào,material,HSK 4
餐厅,cāntīng,restaurant,HSK 4
厕所,cèsuǒ,"toilet, restroom",HSK 4
长城,Chángchéng,the Great Wall of China,HSK 4
长江,Cháng Jiāng,the Yangtze River,HSK 4
成功,chénggōng,success,HSK 4
窗户,chuānghu,window,HSK 4
厨房,chúfáng,kitchen,HSK 4
词语,cíyǔ,"word, expression",HSK 4
错误,cuòwù,"error, mistake; mistaken",HSK 4
答案,dá'àn,answer,HSK 4
大夫,dàifu,doctor,HSK 4
当时,dāngshí,at that time,HSK 4
刀,dāo,knife,HSK 4
导游,dǎoyóu,tour guide,HSK 4
大使馆,dàshǐguǎn,embassy,HSK 4
登机牌,dēngjīpái,boarding pass,HSK 4
底,dǐ,"bottom, base",HSK 4
调查,diàochá,survey,HSK 4
地点,dìdiǎn,"site, location",HSK 4
地球,dìqiú,the Earth,HSK 4
地址,dìzhǐ,address,HSK 4
动作,dòngzuò,movement,HSK 4
短信,duǎnxìn,text message,HSK 4
对话,duìhuà,dialog,HSK 4
对面,duìmiàn,"opposite to, across from",HSK 4
肚子,dùzi,"belly, abdomen",HSK 4
儿童,értóng,children,HSK 4
法律,fǎlǜ,law,HSK 4
房东,fángdōng,landlord,HSK 4
方法,fāngfǎ,method,HSK 4
方面,fāngmiàn,aspect,HSK 4
方向,fāngxiàng,direction,HSK 4
翻译,fānyì,"translation, translator",HSK 4
付款,fùkuǎn,payment,HSK 4
父亲,fùqin,father,HSK 4
感觉,gǎnjué,"sense perception; sensation, feeling",HSK 4
感情,gǎnqíng,deep affection for sb or sth; relationship (i.e. love affair),HSK 4
高速公路,gāosù gōnglù,expressway,HSK 4
胳膊,gēbo,arm,HSK 4
功夫,gōngfu,kung fu; effort,HSK 4
工资,gōngzī,"wages, pay",HSK 4
广播,guǎngbō,broadcast; to broadcast,HSK 4
广告,guǎnggào,advertisement,HSK 4
关键,guānjiàn,key (issue),HSK 4
管理,guǎnlǐ,management,HSK 4
观众,guānzhòng,audience (of a stage performance or visual media),HSK 4
规定,guīdìng,"regulation, rule",HSK 4
顾客,gùkè,customer,HSK 4
鼓励,gǔlì,encouragement,HSK 4
过程,guòchéng,course; process,HSK 4
国籍,guójí,nationality,HSK 4
国际,guójì,international,HSK 4
果汁,guǒzhī,fruit juice,HSK 4
海洋,hǎiyáng,ocean,HSK 4
汗,hàn,"sweat, perspiration",HSK 4
航班,hángbān,flight,HSK 4
寒假,hánjià,winter vacation,HSK 4
好处,hǎochù,benefit,HSK 4
号码,hàomǎ,number,HSK 4
盒子,hézi,"box, case",HSK 4
互联网,Hùliánwǎng,the Internet,HSK 4
活动,huódòng,"activity, event",HSK 4
护士,hùshi,nurse,HSK 4
价格,jiàgé,price,HSK 4
家具,jiājù,furniture,HSK 4
奖金,jiǎngjīn,bonus,HSK 4
将来,jiānglái,in the future,HSK 4
建议,jiànyì,"suggestion, recommendation",HSK 4
郊区,jiāoqū,"suburbs, area on the outskirts of the city",HSK 4
教授,jiàoshòu,professor,HSK 4
交通,jiāotōng,traffic,HSK 4
教育,jiàoyù,education,HSK 4
饺子,jiǎozi,dumpling,HSK 4
加油站,jiāyóuzhàn,gas station,HSK 4
基础,jīchǔ,base; foundation,HSK 4
节,jié,"festival, holiday",HSK 4
结果,jiéguǒ,"result; in the end, as a result",HSK 4
解释,jiěshì,explanation,HSK 4
计划,jìhuà,plan; project; program,HSK 4
警察,jǐngchá,"police, policeman, policewoman",HSK 4
经济,jīngjì,economy,HSK 4
京剧,jīngjù,Beijing opera,HSK 4
经历,jīnglì,an experience,HSK 4
景色,jǐngsè,"scenery, landscape",HSK 4
经验,jīngyàn,(accumulated) experience,HSK 4
竞争,jìngzhēng,competition,HSK 4
技术,jìshù,"technology; skill, technique",HSK 4
记者,jìzhě,journalist,HSK 4
聚会,jùhuì,"party, gathering",HSK 4
距离,jùlí,distance,HSK 4
看法,kànfǎ,point of view,HSK 4
烤鸭,kǎoyā,roast duck,HSK 4
客厅,kètīng,living room (in one's home),HSK 4
科学,kēxué,science; scientific,HSK 4
空气,kōngqì,air,HSK 4
空儿,kòngr,free time,HSK 4
矿泉水,kuàngquánshuǐ,mineral spring water,HSK 4
困难,kùnnan,difficulty,HSK 4
垃圾桶,lājītǒng,trash can,HSK 4
老虎,lǎohǔ,tiger,HSK 4
联系,liánxì,contact,HSK 4
礼拜天,lǐbàitiān,Sunday,HSK 4
礼貌,lǐmào,"politeness, manners",HSK 4
零钱,língqián,(small) change,HSK 4
力气,lìqi,strength,HSK 4
理想,lǐxiǎng,ideal,HSK 4
律师,lǜshī,lawyer,HSK 4
旅行,lǚxíng,trip,HSK 4
麻烦,máfan,"hassle, trouble",HSK 4
毛,máo,"hair, fur",HSK 4
毛巾,máojīn,towel,HSK 4
梦,mèng,dream,HSK 4
密码,mìmǎ,"password, PIN",HSK 4
民族,mínzú,"nationality, ethnic group",HSK 4
目的,mùdì,"purpose, aim, goal",HSK 4
母亲,mǔqīn,mother,HSK 4
耐心,nàixīn,patience,HSK 4
内,nèi,"in, within",HSK 4
内容,nèiróng,content,HSK 4
能力,nénglì,ability,HSK 4
年龄,niánlíng,(a person's) age,HSK 4
判断,pànduàn,judgement,HSK 4
皮肤,pífū,skin,HSK 4
乒乓球,pīngpāngqiú,table tennis,HSK 4
平时,píngshí,usually,HSK 4
批评,pīpíng,criticism,HSK 4
脾气,píqi,"temper, temperament",HSK 4
葡萄,pútao,grape(s),HSK 4
普通话,pǔtōnghuà,"Mandarin (lit. ""common speech"")",HSK 4
签证,qiānzhèng,visa (in a passport),HSK 4
桥,qiáo,bridge,HSK 4
巧克力,qiǎokèlì,chocolate,HSK 4
气候,qìhòu,climate,HSK 4
情况,qíngkuàng,"situation, circumstances",HSK 4
亲戚,qīnqi,relatives,HSK 4
其中,qízhōng,among,HSK 4
全部,quánbù,"whole, entire",HSK 4
区别,qūbié,difference,HSK 4
缺点,quēdiǎn,"weak point, weakness",HSK 4
任务,rènwu,"task, assignment",HSK 4
日记,rìjì,diary,HSK 4
入口,rùkǒu,entrance,HSK 4
森林,sēnlín,forest,HSK 4
沙发,shāfā,sofa,HSK 4
勺子,sháozi,"spoon, ladle",HSK 4
社会,shèhuì,society,HSK 4
省,shěng,province,HSK 4
生活,shēnghuó,life,HSK 4
生命,shēngmìng,(a) life (which you lose when you die),HSK 4
生意,shēngyi,business,HSK 4
申请,shēnqǐng,application,HSK 4
失败,shībài,failure,HSK 4
师傅,shīfu,master; qualified worker,HSK 4
实际,shíjì,actual,HSK 4
世纪,shìjì,century,HSK 4
首都,shǒudū,capital (city),HSK 4
售货员,shòuhuòyuán,salesperson,HSK 4
收入,shōurù,revenue,HSK 4
数量,shùliàng,"amount, quantity",HSK 4
顺序,shùnxù,"order, sequence",HSK 4
说明,shuōmíng,"explanation, directions",HSK 4
硕士,shuòshì,"master's degree, M.A.",HSK 4
数字,shùzì,number,HSK 4
速度,sùdù,speed; rate; velocity,HSK 4
塑料袋,sùliàodài,plastic bag,HSK 4
孙子,sūnzi,grandson,HSK 4
态度,tàidu,attitude,HSK 4
汤,tāng,"soup, broth",HSK 4
糖,táng,sugar; candy,HSK 4
讨论,tǎolùn,discussion,HSK 4
特点,tèdiǎn,"characteristic, special trait",HSK 4
条件,tiáojiàn,"conditions, circumstances, qualifications",HSK 4
同情,tóngqíng,"sympathy, compassion",HSK 4
通知,tōngzhī,a notice,HSK 4
网球,wǎngqiú,tennis,HSK 4
网站,wǎngzhàn,website,HSK 4
袜子,wàzi,socks,HSK 4
味道,wèidào,"flavor, smell, taste",HSK 4
卫生间,wèishēngjiān,restroom,HSK 4
危险,wēixiǎn,danger,HSK 4
温度,wēndù,temperature,HSK 4
文章,wénzhāng,"essay, article",HSK 4
误会,wùhuì,misunderstanding,HSK 4
污染,wūrǎn,pollution; contamination,HSK 4
橡皮,xiàngpí,"rubber, an eraser",HSK 4
现金,xiànjīn,cash,HSK 4
小吃,xiǎochī,snack; refreshments,HSK 4
效果,xiàoguǒ,positive result,HSK 4
笑话,xiàohuà,joke,HSK 4
小伙子,xiǎohuǒzi,young guy,HSK 4
小说,xiǎoshuō,a novel,HSK 4
消息,xiāoxi,news,HSK 4
西红柿,xīhóngshì,tomato,HSK 4
信封,xìnfēng,envelope,HSK 4
性别,xìngbié,gender,HSK 4
幸福,xìngfú,happiness,HSK 4
性格,xìnggé,"personality, character",HSK 4
心情,xīnqíng,mood,HSK 4
信息,xìnxī,information; news; message,HSK 4
信心,xìnxīn,confidence,HSK 4
学期,xuéqī,(school) semester,HSK 4
牙膏,yágāo,toothpaste,HSK 4
压力,yālì,pressure,HSK 4
亚洲,Yàzhōu,Asia,HSK 4
盐,yán,salt,HSK 4
演出,yǎnchū,"performance, concert",HSK 4
样子,yàngzi,appearance,HSK 4
眼镜,yǎnjìng,glasses,HSK 4
研究,yánjiū,research,HSK 4
演员,yǎnyuán,actor or actress,HSK 4
钥匙,yàoshi,key,HSK 4
叶子,yèzi,leaf,HSK 4
意见,yìjiàn,opinion,HSK 4
印象,yìnxiàng,impression,HSK 4
艺术,yìshù,art,HSK 4
优点,yōudiǎn,"strong point, strength",HSK 4
邮局,yóujú,post office,HSK 4
友谊,yǒuyì,friendship,HSK 4
原因,yuányīn,"cause, reason",HSK 4
约会,yuēhuì,appointment; engagement; date;,HSK 4
语法,yǔfǎ,grammar,HSK 4
羽毛球,yǔmáoqiú,"badminton, shuttlecock",HSK 4
云,yún,cloud,HSK 4
语言,yǔyán,language,HSK 4
暂时,zànshí,temporary; temporarily,HSK 4
杂志,zázì,magazine,HSK 4
责任,zérèn,responsibility,HSK 4
招聘,zhāopìn,recruitment,HSK 4
证明,zhèngmíng,proof,HSK 4
支持,zhīchí,support,HSK 4
纸袋,zhǐdài,paper bag,HSK 4
质量,zhìliàng,quality; mass (in physics),HSK 4
知识,zhīshi,knowledge,HSK 4
植物,zhíwù,plant,HSK 4
职业,zhíyè,occupation,HSK 4
重点,zhòngdiǎn,emphasis; focal point,HSK 4
周围,zhōuwéi,"surroundings, environment",HSK 4
专业,zhuānyè,"specialty, major",HSK 4
主意,zhúyi,idea,HSK 4
自然,zìrán,natural,HSK 4
总结,zǒngjié,summary,HSK 4
作家,zuòjiā,writer,HSK 4
座位,zuòwèi,seat,HSK 4
作用,zuòyòng,action; function; activity; impact,HSK 4
左右,zuǒyòu,left and right; approximately,HSK 4
作者,zuòzhě,"author, writer",HSK 4
俩,liǎ,"two, both",HSK 4
千万,qiānwàn,ten million,HSK 4
许多,xǔduō,"many, numerous",HSK 4
等,děng,etc.,HSK 4
呀,ya,[modal particle equivalent often used to express surprise or enthusiasm],HSK 4
之,zhī,"[possessive particle, literary equivalent of 的]",HSK 4
咱们,zánmen,"we, us (you and I)",HSK 4
百分之,bǎifēnzhī,percent,HSK 4
不得不,bùdébù,have no choice but,HSK 4
开玩笑,kāi wánxiào,to play a joke; to make fun of; to joke,HSK 4
打招呼,dǎ zhāohu,to greet somebody,HSK 4
放暑假,fàng shǔjià,to be on summer vacation,HSK 4
受不了,shòu buliǎo,to be unable to stand,HSK 4
弹钢琴,tán gāngqín,to play the piano,HSK 4
按照,ànzhào,according to,HSK 4
当,dāng,at the time of,HSK 4
对于,duìyú,"regarding, with regards to",HSK 4
各,gè,"each, every",HSK 4
连,lián,even,HSK 4
其次,qícì,next,HSK 4
任何,rènhé,any,HSK 4
首先,shǒuxiān,first of all,HSK 4
随着,suízhe,along with,HSK 4
通过,tōngguò,"via, by means of",HSK 4
以,yǐ,"with, using, by means of",HSK 4
一切,yīqiè,everything,HSK 4
由,yóu,by way of; by,HSK 4
与,yú,"with, to",HSK 4
安排,ānpái,to arrange,HSK 4
抱,bào,"to hold, to hug",HSK 4
保护,bǎohù,to protect,HSK 4
报名,bàomíng,to sign up (for),HSK 4
抱歉,bàoqiàn,to be sorry; to feel apologetic; sorry,HSK 4
保证,bǎozhèng,to guarantee,HSK 4
表示,biǎoshì,"to show, to indicate",HSK 4
表演,biǎoyǎn,to perform; to act; to demonstrate,HSK 4
表扬,biǎoyáng,to praise; to commend,HSK 4
比如,bǐrú,for example,HSK 4
毕业,bìyè,to graduate,HSK 4
擦,cā,"to wipe, to scrub, to erase",HSK 4
猜,cāi,to guess,HSK 4
参观,cānguān,to visit; to tour,HSK 4
尝,cháng,to try (a food),HSK 4
超过,chāoguò,to surpass; to exceed; to outstrip,HSK 4
成功,chénggōng,to succeed,HSK 4
成为,chéngwéi,to be,HSK 4
乘坐,chéngzuò,to ride (in a vehicle),HSK 4
吃惊,chījīng,to be surprised,HSK 4
抽烟,chōuyān,to smoke,HSK 4
传真,chuánzhēn,to send by fax,HSK 4
出差,chūchāi,to go on a business trip,HSK 4
出发,chūfā,"to depart, to set off",HSK 4
出生,chūshēng,to be born,HSK 4
出现,chūxiàn,to appear,HSK 4
存,cún,"to save (money, computer files, etc.)",HSK 4
打扮,dǎban,"to dress up, to make oneself up; to dress up (as)",HSK 4
戴,dài,to carry; to wear (an accessory),HSK 4
倒,dǎo,to fall over,HSK 4
道歉,dàoqiàn,to apologize,HSK 4
打扰,dǎrǎo,"to disturb, to bother, to trouble",HSK 4
打印,dǎyìn,to print,HSK 4
打折,dǎzhé,to give a discount,HSK 4
打针,dǎzhēn,to give or have an injection,HSK 4
掉,diào,to fall,HSK 4
调查,diàochá,to survey,HSK 4
丢,diū,"to become lost, to throw, to cast",HSK 4
堵车,dǔchē,(of traffic) to be congested,HSK 4
对话,duìhuà,to have a dialog,HSK 4
反对,fǎnduì,to oppose,HSK 4
放弃,fàngqì,"to give up, to abandon",HSK 4
放松,fàngsōng,to loosen; to relax,HSK 4
翻译,fānyì,to translate,HSK 4
发生,fāshēng,to happen,HSK 4
发展,fāzhǎn,"to develop, to grow, to expand",HSK 4
丰富,fēngfù,to enrich,HSK 4
符合,fúhé,to accord with; to meet (some criteria),HSK 4
付款,fùkuǎn,to make a payment; payment,HSK 4
复印,fùyìn,to photocopy,HSK 4
负责,fùzé,to be in charge of,HSK 4
改变,gǎibiàn,to change; a change,HSK 4
赶,gǎn,"to hurry, to rush, to catch up with",HSK 4
敢,gǎn,to dare (to),HSK 4
干,gàn,to work; to do,HSK 4
干杯,gānbēi,cheers!,HSK 4
感动,gǎndòng,"to move emotionally, to touch emotionally",HSK 4
感谢,gǎnxiè,to be grateful,HSK 4
够,gòu,to be enough,HSK 4
购物,gòuwù,shopping,HSK 4
挂,guà,to hang or suspend (from a hook etc); (of a telephone call) to hang up,HSK 4
逛,guàng,"to stroll around, to browse shops",HSK 4
广播,guǎngbō,to broadcast,HSK 4
管理,guǎnlǐ,to manage; management,HSK 4
规定,guīdìng,to make a regulation,HSK 4
估计,gūjì,to estimate,HSK 4
鼓励,gǔlì,to encourage; encouragement,HSK 4
害羞,hàixiū,shy,HSK 4
合格,hégé,to meet standard,HSK 4
后悔,hòuhuǐ,to regret,HSK 4
怀疑,huáiyí,to suspect; to doubt,HSK 4
回忆,huíyì,to recall,HSK 4
获得,huòdé,to obtain,HSK 4
寄,jì,"to mail, to send",HSK 4
加班,jiābān,"work overtime, work an extra shift",HSK 4
坚持,jiānchí,"to persevere, to persist in",HSK 4
减肥,jiǎnféi,to lose weight,HSK 4
降低,jiàngdī,to reduce,HSK 4
降落,jiàngluò,"to land, to descend",HSK 4
减少,jiǎnshǎo,to decrease,HSK 4
建议,jiànyì,"to suggest, to recommend",HSK 4
交,jiāo,to make (friends),HSK 4
交流,jiāoliú,to communicate,HSK 4
教育,jiàoyù,to educate,HSK 4
解释,jiěshì,to explain,HSK 4
接受,jiēshòu,to accept,HSK 4
节约,jiéyuē,to economize; to conserve (resources),HSK 4
计划,jìhuà,to plan; to map out,HSK 4
积累,jīlěi,to accumulate,HSK 4
经历,jīnglì,to go through (an experience),HSK 4
竞争,jìngzhēng,to compete,HSK 4
镜子,jìngzi,mirror,HSK 4
进行,jìnxíng,"to advance, to conduct, to carry on (a plan of action)",HSK 4
禁止,jìnzhǐ,to prohibit; to forbid; to ban,HSK 4
继续,jìxù,to continue,HSK 4
举,jǔ,"to raise, to lift",HSK 4
举办,jǔbàn,to conduct; to hold,HSK 4
聚会,jùhuì,to have a party,HSK 4
拒绝,jùjué,"to refuse, to reject",HSK 4
举行,jǔxíng,"to hold (a party, meeting, activity, etc.)",HSK 4
考虑,kǎolǜ,to consider,HSK 4
咳嗽,késou,to cough,HSK 4
拉,lā,to pull,HSK 4
来不及,láibují,to not have enough time to,HSK 4
来得及,láidejí,can make it in time,HSK 4
来自,láizì,to come from,HSK 4
浪费,làngfèi,to waste,HSK 4
联系,liánxì,to contact,HSK 4
理发,lǐfà,to get one's hair cut,HSK 4
理解,lǐjiě,to comprehend,HSK 4
例如,lìrú,for example,HSK 4
留,liú,to leave (something for someone),HSK 4
流行,liúxíng,to be popular,HSK 4
旅行,lǚxíng,to travel,HSK 4
麻烦,máfan,to trouble or bother someone,HSK 4
满,mǎn,to reach a quota or limit,HSK 4
免费,miǎnfèi,to be free of charge,HSK 4
迷路,mílù,to get lost,HSK 4
弄,nòng,to do,HSK 4
排队,páiduì,to line up,HSK 4
排列,páiliè,to arrange in order,HSK 4
判断,pànduàn,"to judge, to determine",HSK 4
陪,péi,to accompany; to keep someone company,HSK 4
骗,piàn,"to trick, to fool, to cheat, to deceive",HSK 4
批评,pīpíng,to criticize,HSK 4
破,pò,to break,HSK 4
敲,qiāo,"to knock, to strike, to tap",HSK 4
取,qǔ,to take,HSK 4
缺少,quēshǎo,to lack,HSK 4
扔,rēng,"to throw, to throw away",HSK 4
散步,sànbù,to take a walk,HSK 4
商量,shāngliang,to discuss and come to an agreement,HSK 4
省,shěng,"to save, to economize",HSK 4
剩,shèng,"to remain, to be left",HSK 4
生活,shēnghuó,to live,HSK 4
申请,shēnqǐng,to apply (for),HSK 4
使,shǐ,"to make, to cause",HSK 4
失败,shībài,to fail,HSK 4
适合,shìhé,"to fit, to suit",HSK 4
失望,shīwàng,to be disappointed,HSK 4
适应,shìyìng,to adapt to,HSK 4
使用,shǐyòng,to use; to employ; to apply; to make use of,HSK 4
收,shōu,to receive (money),HSK 4
受到,shòudào,to receive,HSK 4
收拾,shōushi,to clear away,HSK 4
输,shū,to lose (a competition),HSK 4
说明,shuōmíng,"to indicate, to show",HSK 4
熟悉,shúxī,to be familiar with,HSK 4
死,sǐ,to die,HSK 4
抬,tái,"to lift, to raise",HSK 4
谈,tán,to talk,HSK 4
躺,tǎng,to lie on one's back,HSK 4
讨论,tǎolùn,to discuss,HSK 4
讨厌,tǎoyàn,"to dislike, to hate",HSK 4
提,tí,"to raise (an issue), to mention",HSK 4
填空,tiánkòng,to fill in the blank,HSK 4
提供,tígōng,to provide,HSK 4
停,tíng,to stop,HSK 4
提前,tíqián,to move up the date,HSK 4
提醒,tíxǐng,to remind,HSK 4
同情,tóngqíng,to show sympathy for,HSK 4
通知,tōngzhī,to notify,HSK 4
推,tuī,to push,HSK 4
推迟,tuīchí,to postpone,HSK 4
脱,tuō,to take off (clothing),HSK 4
无,wú,not to have,HSK 4
无法,wúfǎ,to have no way to,HSK 4
误会,wùhuì,to misunderstand,HSK 4
污染,wūrǎn,to pollute,HSK 4
响,xiǎng,to make a sound,HSK 4
羡慕,xiànmù,to be envious of,HSK 4
笑话,xiàohuà,to laugh at,HSK 4
行,xíng,"all right, OK",HSK 4
醒,xǐng,to wake up,HSK 4
修理,xiūlǐ,"to repair, to fix",HSK 4
吸引,xīyǐn,to attract,HSK 4
演出,yǎnchū,to perform,HSK 4
养成,yǎngchéng,to cultivate,HSK 4
研究,yánjiū,to research,HSK 4
邀请,yāoqǐng,to invite; invitation,HSK 4
赢,yíng,to win,HSK 4
应聘,yìngpìn,to apply for a job,HSK 4
引起,yǐnqǐ,"to lead to, to cause",HSK 4
以为,yǐwéi,to (mistakenly) think (that),HSK 4
原谅,yuánliàng,to forgive,HSK 4
阅读,yuèdú,to read,HSK 4
约会,yuēhuì,"to date, to go to an appointment",HSK 4
允许,yǔnxǔ,"to allow, to permit",HSK 4
预习,yùxí,to prepare for a lesson,HSK 4
增加,zēngjiā,"to add, to increase",HSK 4
占线,zhànxiàn,to be busy (telephone line),HSK 4
照,zhào,to take a picture,HSK 4
招聘,zhāopìn,to seek applicants for a job,HSK 4
整理,zhěnglǐ,"to organize, to tidy up",HSK 4
证明,zhèngmíng,to prove,HSK 4
指,zhǐ,to refer to,HSK 4
支持,zhīchí,to support,HSK 4
值得,zhíde,to be worth (doing),HSK 4
重视,zhòngshì,"to attach importance to, to value",HSK 4
转,zhuǎn,to revolve; to turn,HSK 4
赚,zhuàn,to earn; to make a profit,HSK 4
祝贺,zhùhè,to congratulate,HSK 4
总结,zǒngjié,to sum up,HSK 4
租,zū,to rent,HSK 4
尊重,zūnzhòng,to respect,HSK 4
作用,zuòyòng,to act on; to affect,HSK 4
啊,a,"ah; (particle)",HSK 5
唉,āi,alas,HSK 5
爱护,àihù,to cherish,HSK 5
爱心,àixīn,compassion,HSK 5
安慰,ānwèi,to comfort,HSK 5
安装,ānzhuāng,to install,HSK 5
岸,àn,"bank; shore",HSK 5
把握,bǎwò,to grasp,HSK 5
摆,bǎi,"to put; to place",HSK 5
班主任,bānzhǔrèn,homeroom teacher,HSK 5
办理,bànlǐ,to handle,HSK 5
傍晚,bàngwǎn,evening,HSK 5
包裹,bāoguǒ,parcel,HSK 5
包含,bāohán,to contain,HSK 5
薄,báo,thin,HSK 5
宝贝,bǎobèi,"treasure; baby",HSK 5
宝贵,bǎoguì,valuable,HSK 5
保持,bǎochí,to maintain,HSK 5
保存,bǎocún,to preserve,HSK 5
保留,bǎoliú,to retain,HSK 5
保险,bǎoxiǎn,insurance,HSK 5
报告,bàogào,report,HSK 5
悲观,bēiguān,pessimistic,HSK 5
背景,bèijǐng,background,HSK 5
被子,bèizi,quilt,HSK 5
本科,běnkē,undergraduate course,HSK 5
本领,běnlǐng,skill,HSK 5
本质,běnzhì,essence,HSK 5
比例,bǐlì,proportion,HSK 5
必然,bìrán,inevitable,HSK 5
必要,bìyào,necessary,HSK 5
毕竟,bìjìng,after all,HSK 5
避免,bìmiǎn,to avoid,HSK 5
编辑,biānjí,to edit,HSK 5
鞭炮,biānpào,firecracker,HSK 5
便,biàn,convenient,HSK 5
辩论,biànlùn,to debate,HSK 5
标点,biāodiǎn,punctuation,HSK 5
标志,biāozhì,"sign; symbol",HSK 5
表达,biǎodá,to express,HSK 5
表面,biǎomiàn,surface,HSK 5
表明,biǎomíng,to indicate,HSK 5
表情,biǎoqíng,facial expression,HSK 5
表现,biǎoxiàn,"to show; performance",HSK 5
丙,bǐng,third,HSK 5
病毒,bìngdú,virus,HSK 5
玻璃,bōli,glass,HSK 5
博物馆,bówùguǎn,museum,HSK 5
脖子,bózi,neck,HSK 5
不必,búbì,need not,HSK 5
不断,búduàn,continuously,HSK 5
不见得,bújiàndé,not necessarily,HSK 5
不耐烦,bú nàifán,impatient,HSK 5
补充,bǔchōng,to supplement,HSK 5
不安,bù'ān,uneasy,HSK 5
不得了,bùdéliǎo,terrible,HSK 5
不好意思,bù hǎoyìsi,to feel embarrassed,HSK 5
不然,bùrán,otherwise,HSK 5
不如,bùrú,not as good as,HSK 5
不要紧,bú yàojǐn,it doesn't matter,HSK 5
不足,bùzú,insufficient,HSK 5
布,bù,cloth,HSK 5
步骤,bùzhòu,step,HSK 5
部门,bùmén,department,HSK 5
财产,cáichǎn,property,HSK 5
采访,cǎifǎng,to interview,HSK 5
采取,cǎiqǔ,to adopt,HSK 5
彩虹,cǎihóng,rainbow,HSK 5
踩,cǎi,to step on,HSK 5
参考,cānkǎo,to refer to,HSK 5
参与,cānyù,to participate in,HSK 5
惭愧,cánkuì,ashamed,HSK 5
操场,cāochǎng,playground,HSK 5
操心,cāoxīn,to worry about,HSK 5
册,cè,"volume; book",HSK 5
测验,cèyàn,test,HSK 5
曾经,céngjīng,once,HSK 5
插,chā,to insert,HSK 5
差别,chābié,difference,HSK 5
叉子,chāzi,fork,HSK 5
拆,chāi,to dismantle,HSK 5
产品,chǎnpǐn,product,HSK 5
产生,chǎnshēng,to produce,HSK 5
常识,chángshí,common sense,HSK 5
长途,chángtú,long distance,HSK 5
朝,cháo,towards,HSK 5
朝代,cháodài,dynasty,HSK 5
炒,chǎo,to stir-fry,HSK 5
吵架,chǎojià,to quarrel,HSK 5
车库,chēkù,garage,HSK 5
车厢,chēxiāng,railway carriage,HSK 5
彻底,chèdǐ,thorough,HSK 5
沉默,chénmò,silent,HSK 5
趁,chèn,to take advantage of,HSK 5
称,chēng,to call,HSK 5
称呼,chēnghu,to address as,HSK 5
称赞,chēngzàn,to praise,HSK 5
成分,chéngfèn,ingredient,HSK 5
成果,chéngguǒ,result,HSK 5
成就,chéngjiù,achievement,HSK 5
成立,chénglì,to establish,HSK 5
成人,chéngrén,adult,HSK 5
成熟,chéngshú,mature,HSK 5
成语,chéngyǔ,idiom,HSK 5
成长,chéngzhǎng,to grow up,HSK 5
诚恳,chéngkěn,sincere,HSK 5
承担,chéngdān,to undertake,HSK 5
承认,chéngrèn,to admit,HSK 5
承受,chéngshòu,to bear,HSK 5
程度,chéngdù,degree,HSK 5
程序,chéngxù,procedure,HSK 5
吃亏,chīkuī,to suffer losses,HSK 5
池塘,chítáng,pond,HSK 5
迟早,chízǎo,sooner or later,HSK 5
持续,chíxù,to continue,HSK 5
尺子,chǐzi,ruler,HSK 5
翅膀,chìbǎng,wing,HSK 5
冲,chōng,to rush,HSK 5
充电器,chōngdiànqì,charger,HSK 5
充分,chōngfèn,sufficient,HSK 5
充满,chōngmǎn,to be full of,HSK 5
重复,chóngfù,to repeat,HSK 5
宠物,chǒngwù,pet,HSK 5
抽屉,chōuti,drawer,HSK 5
抽象,chōuxiàng,abstract,HSK 5
丑,chǒu,ugly,HSK 5
臭,chòu,stinky,HSK 5
出版,chūbǎn,to publish,HSK 5
出口,chūkǒu,exit,HSK 5
出色,chūsè,outstanding,HSK 5
出示,chūshì,to show,HSK 5
出席,chūxí,to attend,HSK 5
初级,chūjí,elementary,HSK 5
除非,chúfēi,unless,HSK 5
除夕,chúxī,New Year's Eve,HSK 5
处理,chǔlǐ,to handle,HSK 5
传播,chuánbō,to disseminate,HSK 5
传染,chuánrǎn,to infect,HSK 5
传说,chuánshuō,legend,HSK 5
传统,chuántǒng,tradition,HSK 5
窗帘,chuānglián,curtain,HSK 5
闯,chuǎng,to rush,HSK 5
创造,chuàngzào,to create,HSK 5
吹,chuī,to blow,HSK 5
磁带,cídài,cassette tape,HSK 5
辞职,cízhí,to resign,HSK 5
此外,cǐwài,besides,HSK 5
次要,cìyào,secondary,HSK 5
刺激,cìjī,to stimulate,HSK 5
匆忙,cōngmáng,hasty,HSK 5
从此,cóngcǐ,from now on,HSK 5
从而,cóng'ér,thus,HSK 5
从前,cóngqián,formerly,HSK 5
从事,cóngshì,to be engaged in,HSK 5
粗糙,cūcāo,rough,HSK 5
促进,cùjìn,to promote,HSK 5
促使,cùshǐ,to impel,HSK 5
醋,cù,vinegar,HSK 5
催,cuī,to urge,HSK 5
存在,cúnzài,to exist,HSK 5
措施,cuòshī,measure,HSK 5
答应,dāying,to promise,HSK 5
达到,dádào,to achieve,HSK 5
打工,dǎgōng,to work part-time,HSK 5
打交道,dǎ jiāodao,to deal with,HSK 5
打喷嚏,dǎ pēntì,to sneeze,HSK 5
打听,dǎting,to inquire,HSK 5
大方,dàfang,generous,HSK 5
大厦,dàshà,mansion,HSK 5
大象,dàxiàng,elephant,HSK 5
大型,dàxíng,large-scale,HSK 5
呆,dāi,to stay,HSK 5
代表,dàibiǎo,to represent,HSK 5
代替,dàitì,to replace,HSK 5
贷款,dàikuǎn,loan,HSK 5
待遇,dàiyù,treatment,HSK 5
担任,dānrèn,to serve as,HSK 5
单纯,dānchún,simple,HSK 5
单调,dāndiào,monotonous,HSK 5
单独,dāndú,alone,HSK 5
单位,dānwèi,unit,HSK 5
单元,dānyuán,unit,HSK 5
耽误,dānwu,to delay,HSK 5
胆小鬼,dǎnxiǎoguǐ,coward,HSK 5
淡,dàn,light (in color),HSK 5
当地,dāngdì,local,HSK 5
当心,dāngxīn,to be careful,HSK 5
挡,dǎng,to block,HSK 5
导演,dǎoyǎn,director,HSK 5
导致,dǎozhì,to lead to,HSK 5
岛屿,dǎoyǔ,island,HSK 5
倒霉,dǎoméi,unlucky,HSK 5
到达,dàodá,to arrive,HSK 5
道德,dàodé,morality,HSK 5
道理,dàolǐ,reason,HSK 5
登记,dēngjì,to register,HSK 5
等待,dĕngdài,to wait,HSK 5
等候,děnghòu,to wait,HSK 5
等于,děngyú,to equal,HSK 5
滴,dī,to drip,HSK 5
的确,díquè,indeed,HSK 5
敌人,dírén,enemy,HSK 5
地道,dìdao,authentic,HSK 5
地理,dìlǐ,geography,HSK 5
地区,dìqū,area,HSK 5
地毯,dìtǎn,carpet,HSK 5
地位,dìwèi,status,HSK 5
地震,dìzhèn,earthquake,HSK 5
递,dì,to pass,HSK 5
点心,diǎnxin,dessert,HSK 5
电池,diànchí,battery,HSK 5
电台,diàntái,radio station,HSK 5
钓,diào,to fish,HSK 5
顶,dǐng,top,HSK 5
动画片,dònghuàpiàn,cartoon,HSK 5
冻,dòng,to freeze,HSK 5
洞,dòng,hole,HSK 5
豆腐,dòufu,tofu,HSK 5
逗,dòu,to tease,HSK 5
独立,dúlì,independent,HSK 5
独特,dútè,unique,HSK 5
度过,dùguò,to spend,HSK 5
断,duàn,to break,HSK 5
堆,duī,pile,HSK 5
对比,duìbǐ,to contrast,HSK 5
对待,duìdài,to treat,HSK 5
对方,duìfāng,the other party,HSK 5
对手,duìshǒu,opponent,HSK 5
对象,duìxiàng,target,HSK 5
兑换,duìhuàn,to exchange,HSK 5
吨,dūn,ton,HSK 5
蹲,dūn,to squat,HSK 5
顿,dùn,pause,HSK 5
多亏,duōkuī,thanks to,HSK 5
多余,duōyú,superfluous,HSK 5
躲藏,duǒcáng,to hide,HSK 5
恶劣,èliè,vile,HSK 5
发表,fābiǎo,to publish,HSK 5
发愁,fāchóu,to worry,HSK 5
发达,fādá,developed,HSK 5
发抖,fādǒu,to tremble,HSK 5
发挥,fāhuī,to bring into play,HSK 5
发明,fāmíng,to invent,HSK 5
发票,fāpiào,invoice,HSK 5
发言,fāyán,to make a speech,HSK 5
罚款,fákuǎn,to fine,HSK 5
法院,fǎyuàn,court,HSK 5
翻,fān,to turn over,HSK 5
繁荣,fánróng,prosperous,HSK 5
凡是,fánshì,every,HSK 5
反而,fǎn'ér,on the contrary,HSK 5
反复,fǎnfù,repeatedly,HSK 5
反应,fǎnyìng,reaction,HSK 5
反映,fǎnyìng,to reflect,HSK 5
反正,fǎnzhèng,anyway,HSK 5
范围,fànwéi,scope,HSK 5
方,fāng,square,HSK 5
方案,fāng'àn,plan,HSK 5
方式,fāngshì,way,HSK 5
妨碍,fáng'ài,to hinder,HSK 5
仿佛,fǎngfú,as if,HSK 5
非,fēi,not,HSK 5
肥皂,féizào,soap,HSK 5
废话,fèihuà,nonsense,HSK 5
分别,fēnbié,to part,HSK 5
分布,fēnbù,to be distributed,HSK 5
分配,fēnpèi,to distribute,HSK 5
分解,fēnjiě,to decompose,HSK 5
分析,fēnxī,to analyze,HSK 5
纷纷,fēnfēn,one after another,HSK 5
奋斗,fèndòu,to strive,HSK 5
风格,fēnggé,style,HSK 5
风景,fēngjǐng,scenery,HSK 5
风俗,fēngsú,custom,HSK 5
风险,fēngxiǎn,risk,HSK 5
疯狂,fēngkuáng,crazy,HSK 5
讽刺,fěngcì,to satirize,HSK 5
否定,fǒudìng,to deny,HSK 5
否认,fǒurèn,to deny,HSK 5
扶,fú,to support with the hand,HSK 5
幅,fú,measure word for paintings,HSK 5
服装,fúzhuāng,clothing,HSK 5
辅导,fǔdǎo,to tutor,HSK 5
妇女,fùnǚ,woman,HSK 5
复制,fùzhì,to copy,HSK 5
改革,gǎigé,to reform,HSK 5
改进,gǎijìn,to improve,HSK 5
改善,gǎishàn,to improve,HSK 5
改正,gǎizhèng,to correct,HSK 5
盖,gài,to cover,HSK 5
概括,gàikuò,to summarize,HSK 5
概念,gàiniàn,concept,HSK 5
干脆,gāncuì,simply,HSK 5
干燥,gānzào,dry,HSK 5
赶紧,gǎnjǐn,hurriedly,HSK 5
赶快,gǎnkuài,quickly,HSK 5
感激,gǎnjī,to be grateful,HSK 5
感受,gǎnshòu,to feel,HSK 5
感想,gǎnxiǎng,thoughts,HSK 5
干活儿,gàn huór,to work,HSK 5
钢铁,gāngtiě,steel,HSK 5
高档,gāodàng,high-grade,HSK 5
高级,gāojí,senior,HSK 5
搞,gǎo,to do,HSK 5
告别,gàobié,to say goodbye,HSK 5
格外,géwài,especially,HSK 5
隔壁,gébì,next door,HSK 5
个别,gèbié,individual,HSK 5
个人,gèrén,individual,HSK 5
个性,gèxìng,personality,HSK 5
各自,gèzì,each,HSK 5
根,gēn,root,HSK 5
根本,gēnběn,fundamental,HSK 5
工厂,gōngchǎng,factory,HSK 5
工程师,gōngchéngshī,engineer,HSK 5
工具,gōngjù,tool,HSK 5
工人,gōngrén,worker,HSK 5
工业,gōngyè,industry,HSK 5
公布,gōngbù,to announce,HSK 5
公开,gōngkāi,public,HSK 5
公平,gōngpíng,fair,HSK 5
公寓,gōngyù,apartment,HSK 5
公元,gōngyuán,A.D.,HSK 5
公主,gōngzhǔ,princess,HSK 5
功能,gōngnéng,function,HSK 5
恭喜,gōngxǐ,to congratulate,HSK 5
贡献,gòngxiàn,to contribute,HSK 5
沟通,gōutōng,to communicate,HSK 5
构成,gòuchéng,to constitute,HSK 5
姑姑,gūgu,aunt (father's sister),HSK 5
姑娘,gūniang,girl,HSK 5
古代,gǔdài,ancient times,HSK 5
古典,gǔdiǎn,classical,HSK 5
古老,gǔlǎo,ancient,HSK 5
股票,gǔpiào,stock,HSK 5
骨头,gǔtou,bone,HSK 5
鼓舞,gǔwǔ,to inspire,HSK 5
鼓掌,gǔzhǎng,to applaud,HSK 5
固定,gùdìng,fixed,HSK 5
挂号,guàhào,to register,HSK 5
乖,guāi,well-behaved,HSK 5
拐弯,guǎiwān,to turn a corner,HSK 5
怪不得,guàibude,no wonder,HSK 5
关闭,guānbì,to close,HSK 5
观察,guānchá,to observe,HSK 5
观点,guāndiǎn,point of view,HSK 5
观念,guānniàn,concept,HSK 5
官,guān,official,HSK 5
管子,guǎnzi,tube,HSK 5
冠军,guànjūn,champion,HSK 5
光滑,guānghuá,smooth,HSK 5
光临,guānglín,to be present,HSK 5
光明,guāngmíng,bright,HSK 5
光盘,guāngpán,CD,HSK 5
广场,guǎngchǎng,square,HSK 5
广大,guǎngdà,vast,HSK 5
广泛,guǎngfàn,extensive,HSK 5
归纳,guīnà,to conclude,HSK 5
规律,guīlǜ,law,HSK 5
规模,guīmó,scale,HSK 5
规则,guīzé,rule,HSK 5
柜台,guìtái,counter,HSK 5
滚,gǔn,to roll,HSK 5
锅,guō,pot,HSK 5
国庆节,Guóqìngjié,National Day,HSK 5
国王,guówáng,king,HSK 5
果然,guǒrán,sure enough,HSK 5
果实,guǒshí,fruit,HSK 5
过分,guòfèn,excessive,HSK 5
过敏,guòmǐn,to be allergic,HSK 5
过期,guòqī,to expire,HSK 5
哈,hā,(sound of laughter),HSK 5
海关,hǎiguān,customs,HSK 5
海鲜,hǎixiān,seafood,HSK 5
喊,hǎn,to shout,HSK 5
行业,hángyè,industry,HSK 5
豪华,háohuá,luxurious,HSK 5
好客,hàokè,hospitable,HSK 5
好奇,hàoqí,curious,HSK 5
合法,héfǎ,legal,HSK 5
合影,héyǐng,group photo,HSK 5
合作,hézuò,to cooperate,HSK 5
何必,hébì,why bother,HSK 5
何况,hékuàng,let alone,HSK 5
和平,hépíng,peace,HSK 5
核心,héxīn,core,HSK 5
恨,hèn,to hate,HSK 5
猴子,hóuzi,monkey,HSK 5
后背,hòubèi,back,HSK 5
后果,hòuguǒ,consequence,HSK 5
呼吸,hūxī,to breathe,HSK 5
忽然,hūrán,suddenly,HSK 5
忽略,hūlüè,to neglect,HSK 5
胡说,húshuō,to talk nonsense,HSK 5
胡同,hútòng,alley,HSK 5
壶,hú,pot,HSK 5
蝴蝶,húdié,butterfly,HSK 5
糊涂,hútu,muddled,HSK 5
花生,huāshēng,peanut,HSK 5
划,huà,to draw,HSK 5
华裔,huáyì,person of Chinese descent,HSK 5
滑,huá,slippery,HSK 5
化学,huàxué,chemistry,HSK 5
话题,huàtí,topic,HSK 5
怀念,huáiniàn,to miss,HSK 5
怀孕,huáiyùn,to be pregnant,HSK 5
缓解,huǎnjiě,to relieve,HSK 5
幻想,huànxiǎng,to fantasize,HSK 5
慌张,huāngzhāng,flustered,HSK 5
黄金,huángjīn,gold,HSK 5
皇帝,huángdì,emperor,HSK 5
皇后,huánghòu,empress,HSK 5
黄瓜,huángguā,cucumber,HSK 5
挥,huī,to wave,HSK 5
灰,huī,ash,HSK 5
灰尘,huīchén,dust,HSK 5
灰心,huīxīn,to lose heart,HSK 5
恢复,huīfù,to recover,HSK 5
汇率,huìlǜ,exchange rate,HSK 5
婚礼,hūnlǐ,wedding,HSK 5
婚姻,hūnyīn,marriage,HSK 5
活跃,huóyuè,active,HSK 5
火柴,huǒchái,match,HSK 5
伙伴,huǒbàn,partner,HSK 5
或许,huòxǔ,perhaps,HSK 5
机器,jīqì,machine,HSK 5
肌肉,jīròu,muscle,HSK 5
基本,jīběn,basic,HSK 5
激烈,jīliè,intense,HSK 5
及格,jígé,to pass a test,HSK 5
急忙,jímáng,hastily,HSK 5
集体,jítǐ,collective,HSK 5
集中,jízhōng,to concentrate,HSK 5
计算,jìsuàn,to calculate,HSK 5
记录,jìlù,to record,HSK 5
记忆,jìyì,memory,HSK 5
系领带,jì lǐngdài,to tie a tie,HSK 5
纪录,jìlù,record,HSK 5
纪律,jìlǜ,discipline,HSK 5
寂寞,jìmò,lonely,HSK 5
家庭,jiātíng,family,HSK 5
家务,jiāwù,housework,HSK 5
家乡,jiāxiāng,hometown,HSK 5
夹子,jiāzi,clip,HSK 5
甲,jiǎ,first,HSK 5
假如,jiǎrú,if,HSK 5
假装,jiǎzhuāng,to pretend,HSK 5
嫁,jià,to marry (of a woman),HSK 5
价值,jiàzhí,value,HSK 5
驾驶,jiàshǐ,to drive,HSK 5
肩膀,jiānbǎng,shoulder,HSK 5
坚决,jiānjué,firm,HSK 5
坚强,jiānqiáng,strong,HSK 5
艰巨,jiānjù,arduous,HSK 5
艰苦,jiānkǔ,difficult,HSK 5
尖锐,jiānruì,sharp,HSK 5
捡,jiǎn,to pick up,HSK 5
剪刀,jiǎndāo,scissors,HSK 5
简历,jiǎnlì,resume,HSK 5
简直,jiǎnzhí,simply,HSK 5
建立,jiànlì,to establish,HSK 5
建设,jiànshè,to build,HSK 5
建筑,jiànzhù,building,HSK 5
健身,jiànshēn,to exercise,HSK 5
键盘,jiànpán,keyboard,HSK 5
讲究,jiǎngjiu,to be particular about,HSK 5
讲座,jiǎngzuò,lecture,HSK 5
酱油,jiàngyóu,soy sauce,HSK 5
交换,jiāohuàn,to exchange,HSK 5
交际,jiāojì,to socialize,HSK 5
浇,jiāo,to pour,HSK 5
胶水,jiāoshuǐ,glue,HSK 5
角度,jiǎodù,angle,HSK 5
狡猾,jiǎohuá,cunning,HSK 5
教材,jiàocái,teaching material,HSK 5
教练,jiàoliàn,coach,HSK 5
教训,jiàoxun,lesson,HSK 5
阶段,jiēduàn,stage,HSK 5
结实,jiēshi,sturdy,HSK 5
接触,jiēchù,to contact,HSK 5
接待,jiēdài,to receive,HSK 5
接近,jiējìn,to be close to,HSK 5
节省,jiéshěng,to save,HSK 5
结构,jiégòu,structure,HSK 5
结合,jiéhé,to combine,HSK 5
结论,jiélùn,conclusion,HSK 5
结账,jiézhàng,to pay the bill,HSK 5
戒,jiè,to give up,HSK 5
戒指,jièzhi,ring,HSK 5
届,jiè,measure word for events,HSK 5
借口,jièkǒu,excuse,HSK 5
金属,jīnshǔ,metal,HSK 5
紧,jǐn,tight,HSK 5
紧急,jǐnjí,urgent,HSK 5
谨慎,jǐnshèn,cautious,HSK 5
尽力,jìnlì,to do one's best,HSK 5
尽量,jǐnliàng,as much as possible,HSK 5
进步,jìnbù,to make progress,HSK 5
进口,jìnkǒu,to import,HSK 5
近代,jìndài,modern times,HSK 5
经典,jīngdiǎn,classic,HSK 5
经商,jīngshāng,to do business,HSK 5
经营,jīngyíng,to operate,HSK 5
精力,jīnglì,energy,HSK 5
精神,jīngshén,spirit,HSK 5
酒吧,jiǔbā,bar,HSK 5
救,jiù,to save,HSK 5
救护车,jiùhùchē,ambulance,HSK 5
舅舅,jiùjiu,uncle (mother's brother),HSK 5
居然,jūrán,unexpectedly,HSK 5
桔子,júzi,tangerine,HSK 5
巨大,jùdà,huge,HSK 5
具备,jùbèi,to possess,HSK 5
具体,jùtǐ,specific,HSK 5
俱乐部,jùlèbù,club,HSK 5
据说,jùshuō,it is said,HSK 5
捐,juān,to donate,HSK 5
卷,juǎn,to roll,HSK 5
决赛,juésài,finals (of a competition),HSK 5
决心,juéxīn,determination,HSK 5
角色,juésè,role,HSK 5
绝对,juéduì,absolute,HSK 5
军事,jūnshì,military,HSK 5
均匀,jūnyún,even,HSK 5
卡车,kǎchē,truck,HSK 5
开发,kāifā,to develop,HSK 5
开放,kāifàng,to open,HSK 5
开幕式,kāimùshì,opening ceremony,HSK 5
开水,kāishuǐ,boiling water,HSK 5
砍,kǎn,to chop,HSK 5
看不起,kànbuqǐ,to look down upon,HSK 5
看来,kànlái,it seems,HSK 5
抗议,kàngyì,to protest,HSK 5
烤,kǎo,to roast,HSK 5
颗,kē,measure word for small and round things,HSK 5
可见,kějiàn,it is obvious that,HSK 5
可靠,kěkào,reliable,HSK 5
课程,kèchéng,course,HSK 5
克,kè,gram,HSK 5
克服,kèfú,to overcome,HSK 5
刻苦,kèkǔ,hardworking,HSK 5
客观,kèguān,objective,HSK 5
空间,kōngjiān,space,HSK 5
恐怖,kǒngbù,terrible,HSK 5
空闲,kòngxián,free time,HSK 5
控制,kòngzhì,to control,HSK 5
口味,kǒuwèi,taste,HSK 5
夸,kuā,to praise,HSK 5
会计,kuàijì,accountant,HSK 5
矿泉水,kuàngquánshuǐ,mineral water,HSK 5
辣椒,làjiāo,chili,HSK 5
蜡烛,làzhú,candle,HSK 5
来自,láizì,to come from,HSK 5
拦,lán,to block,HSK 5
烂,làn,rotten,HSK 5
狼,láng,wolf,HSK 5
劳动,láodòng,labor,HSK 5
劳驾,láojià,excuse me,HSK 5
老百姓,lǎobǎixìng,common people,HSK 5
老板,lǎobǎn,boss,HSK 5
老婆,lǎopo,wife,HSK 5
老实,lǎoshi,honest,HSK 5
老鼠,lǎoshǔ,mouse,HSK 5
姥姥,lǎolao,maternal grandmother,HSK 5
乐观,lèguān,optimistic,HSK 5
雷,léi,thunder,HSK 5
类型,lèixíng,type,HSK 5
冷淡,lěngdàn,"cold; indifferent",HSK 5
厘米,límǐ,centimeter,HSK 5
离婚,líhūn,to divorce,HSK 5
梨,lí,pear,HSK 5
理论,lǐlùn,theory,HSK 5
理由,lǐyóu,reason,HSK 5
力量,lìliàng,strength,HSK 5
立即,lìjí,immediately,HSK 5
立刻,lìkè,immediately,HSK 5
利润,lìrùn,profit,HSK 5
利息,lìxī,interest,HSK 5
利益,lìyì,benefit,HSK 5
利用,lìyòng,to make use of,HSK 5
连忙,liánmáng,promptly,HSK 5
连续剧,liánxùjù,TV series,HSK 5
联合,liánhé,to unite,HSK 5
恋爱,liàn'ài,to be in love,HSK 5
良好,liánghǎo,good,HSK 5
粮食,liángshi,grain,HSK 5
了不起,liǎobuqǐ,amazing,HSK 5
临时,línshí,temporary,HSK 5
灵活,línghuó,flexible,HSK 5
铃,líng,bell,HSK 5
零件,língjiàn,spare part,HSK 5
零食,língshí,snack,HSK 5
领导,lǐngdǎo,leader,HSK 5
领域,lǐngyù,field,HSK 5
流传,liúchuán,to spread,HSK 5
浏览,liúlǎn,to browse,HSK 5
龙,lóng,dragon,HSK 5
漏,lòu,to leak,HSK 5
露,lù,to show,HSK 5
陆地,lùdì,land,HSK 5
陆续,lùxù,one after another,HSK 5
录取,lùqǔ,to admit,HSK 5
录音,lùyīn,to record,HSK 5
轮流,lúnliú,to take turns,HSK 5
论文,lùnwén,thesis,HSK 5
逻辑,luójí,logic,HSK 5
落后,luòhòu,to fall behind,HSK 5
骂,mà,to scold,HSK 5
麦克风,màikèfēng,microphone,HSK 5
馒头,mántou,steamed bun,HSK 5
满足,mǎnzú,to satisfy,HSK 5
毛病,máobìng,fault,HSK 5
矛盾,máodùn,contradiction,HSK 5
冒险,màoxiǎn,to take risks,HSK 5
贸易,màoyì,trade,HSK 5
眉毛,méimao,eyebrow,HSK 5
媒体,méitǐ,media,HSK 5
煤炭,méitàn,coal,HSK 5
美术,měishù,fine arts,HSK 5
魅力,mèilì,charm,HSK 5
迷信,míxìn,superstition,HSK 5
谜语,míyǔ,riddle,HSK 5
蜜蜂,mìfēng,bee,HSK 5
密切,mìqiè,close,HSK 5
秘密,mìmì,secret,HSK 5
秘书,mìshū,secretary,HSK 5
棉花,miánhua,cotton,HSK 5
面对,miànduì,to face,HSK 5
面积,miànjī,area,HSK 5
面临,miànlín,to be faced with,HSK 5
苗条,miáotiao,slim,HSK 5
描写,miáoxiě,to describe,HSK 5
秒,miǎo,second,HSK 5
民主,mínzhǔ,democracy,HSK 5
明确,míngquè,clear,HSK 5
明显,míngxiǎn,obvious,HSK 5
明信片,míngxìnpiàn,postcard,HSK 5
明星,míngxīng,star (celebrity),HSK 5
名牌,míngpái,famous brand,HSK 5
名片,míngpiàn,business card,HSK 5
名胜古迹,míngshèng gǔjì,scenic spots and historic sites,HSK 5
命令,mìnglìng,to command,HSK 5
命运,mìngyùn,fate,HSK 5
摸,mō,to touch,HSK 5
模仿,mófǎng,to imitate,HSK 5
模糊,móhu,vague,HSK 5
摩托车,mótuōchē,motorcycle,HSK 5
陌生,mòshēng,strange,HSK 5
某,mǒu,some,HSK 5
木头,mùtou,wood,HSK 5
目标,mùbiāo,target,HSK 5
目录,mùlù,catalog,HSK 5
目前,mùqián,at present,HSK 5
哪怕,nǎpà,even if,HSK 5
内科,nèikē,internal medicine,HSK 5
嫩,nèn,tender,HSK 5
能干,nénggàn,capable,HSK 5
能源,néngyuán,energy source,HSK 5
嗯,èn,(interjection),HSK 5
年代,niándài,decade,HSK 5
年纪,niánjì,age,HSK 5
念,niàn,to read aloud,HSK 5
宁可,nìngkě,would rather,HSK 5
牛仔裤,niúzǎikù,jeans,HSK 5
农村,nóngcūn,countryside,HSK 5
农民,nóngmín,farmer,HSK 5
农业,nóngyè,agriculture,HSK 5
浓,nóng,dense,HSK 5
女士,nǚshì,lady,HSK 5
欧洲,Ōuzhōu,Europe,HSK 5
哦,ò,oh,HSK 5
偶然,ǒurán,accidental,HSK 5
拍,pāi,to pat,HSK 5
派,pài,to send,HSK 5
盼望,pànwàng,to look forward to,HSK 5
赔偿,péicháng,to compensate,HSK 5
培养,péiyǎng,to cultivate,HSK 5
佩服,pèifu,to admire,HSK 5
配合,pèihé,to coordinate,HSK 5
盆,pén,basin,HSK 5
碰,pèng,to touch,HSK 5
批,pī,batch,HSK 5
批准,pīzhǔn,to approve,HSK 5
披,pī,to drape over one's shoulders,HSK 5
疲劳,píláo,fatigue,HSK 5
匹,pǐ,measure word for horses,HSK 5
片,piàn,slice,HSK 5
片面,piànmiàn,one-sided,HSK 5
飘,piāo,to float,HSK 5
拼音,pīnyīn,pinyin,HSK 5
频道,píndào,channel,HSK 5
凭,píng,to rely on,HSK 5
平均,píngjūn,average,HSK 5
平,píng,flat,HSK 5
平方,píngfāng,square (as in square meter),HSK 5
平衡,pínghéng,balance,HSK 5
平静,píngjìng,calm,HSK 5
平常,píngcháng,usually,HSK 5
平等,píngděng,equal,HSK 5
破产,pòchǎn,to go bankrupt,HSK 5
破坏,pòhuài,to destroy,HSK 5
迫切,pòqiè,urgent,HSK 5
朴素,pǔsù,plain,HSK 5
期待,qīdài,to look forward to,HSK 5
期间,qījiān,period,HSK 5
其余,qíyú,the rest,HSK 5
奇迹,qíjì,miracle,HSK 5
企业,qǐyè,enterprise,HSK 5
启发,qǐfā,to enlighten,HSK 5
气氛,qìfēn,atmosphere,HSK 5
汽油,qìyóu,gasoline,HSK 5
谦虚,qiānxū,modest,HSK 5
前途,qiántú,future,HSK 5
欠,qiàn,to owe,HSK 5
签字,qiānzì,to sign,HSK 5
墙,qiáng,wall,HSK 5
抢,qiǎng,to rob,HSK 5
悄悄,qiāoqiāo,quietly,HSK 5
瞧,qiáo,to look,HSK 5
巧妙,qiǎomiào,ingenious,HSK 5
切,qiē,to cut,HSK 5
亲爱,qīn'ài,dear,HSK 5
亲切,qīnqiè,cordial,HSK 5
亲自,qīnzì,personally,HSK 5
侵略,qīnlüè,to invade,HSK 5
勤奋,qínfèn,diligent,HSK 5
勤劳,qínláo,industrious,HSK 5
青,qīng,blue-green,HSK 5
青春,qīngchūn,youth,HSK 5
青少年,qīngshàonián,teenager,HSK 5
轻视,qīngshì,to look down on,HSK 5
清淡,qīngdàn,light (of food),HSK 5
情景,qíngjǐng,scene,HSK 5
情绪,qíngxù,mood,HSK 5
请求,qǐngqiú,to request,HSK 5
庆祝,qìngzhù,to celebrate,HSK 5
球迷,qiúmí,fan (of a sport),HSK 5
趋势,qūshì,trend,HSK 5
娶,qǔ,to marry (a woman),HSK 5
取消,qǔxiāo,to cancel,HSK 5
去世,qùshì,to pass away,HSK 5
圈,quān,circle,HSK 5
权力,quánlì,power,HSK 5
权利,quánlì,right,HSK 5
全面,quánmiàn,comprehensive,HSK 5
劝,quàn,to advise,HSK 5
缺乏,quēfá,to lack,HSK 5
确定,quèdìng,to determine,HSK 5
确认,quèrèn,to confirm,HSK 5
群,qún,group,HSK 5
燃烧,ránshāo,to burn,HSK 5
绕,rào,to circle,HSK 5
热爱,rè'ài,to love ardently,HSK 5
热烈,rèliè,warm,HSK 5
热心,rèxīn,enthusiastic,HSK 5
人才,réncái,talented person,HSK 5
人口,rénkǒu,population,HSK 5
人类,rénlèi,mankind,HSK 5
人生,rénshēng,life,HSK 5
人事,rénshì,human affairs,HSK 5
人物,rénwù,character,HSK 5
人员,rényuán,personnel,HSK 5
忍不住,rěnbuzhù,cannot help,HSK 5
日常,rìcháng,daily,HSK 5
日程,rìchéng,schedule,HSK 5
日历,rìlì,calendar,HSK 5
日期,rìqī,date,HSK 5
日用品,rìyòngpǐn,daily necessities,HSK 5
融化,rónghuà,to melt,HSK 5
荣幸,róngxing,honored,HSK 5
荣誉,róngyù,honor,HSK 5
如何,rúhé,how,HSK 5
如今,rújīn,nowadays,HSK 5
软件,ruǎnjiàn,software,HSK 5
弱,ruò,weak,HSK 5
洒,sǎ,to sprinkle,HSK 5
嗓子,sǎngzi,throat,HSK 5
杀,shā,to kill,HSK 5
沙漠,shāmò,desert,HSK 5
沙滩,shātān,beach,HSK 5
傻,shǎ,foolish,HSK 5
晒,shài,to sunbathe,HSK 5
删除,shānchú,to delete,HSK 5
闪电,shǎndiàn,lightning,HSK 5
善良,shànliáng,kind-hearted,HSK 5
善于,shànyú,to be good at,HSK 5
扇子,shànzi,fan,HSK 5
商品,shāngpǐn,commodity,HSK 5
商业,shāngyè,commerce,HSK 5
上当,shàngdàng,to be fooled,HSK 5
勺子,sháozi,spoon,HSK 5
蛇,shé,snake,HSK 5
舌头,shétou,tongue,HSK 5
舍不得,shěbude,to hate to part with,HSK 5
设备,shèbèi,equipment,HSK 5
设计,shèjì,to design,HSK 5
设施,shèshī,facilities,HSK 5
射击,shèjī,to shoot,HSK 5
摄影,shèyǐng,to take a photograph,HSK 5
伸,shēn,to stretch,HSK 5
身材,shēncái,figure,HSK 5
身份,shēnfèn,identity,HSK 5
深刻,shēnkè,profound,HSK 5
神话,shénhuà,myth,HSK 5
神秘,shénmì,mysterious,HSK 5
升,shēng,to rise,HSK 5
生产,shēngchǎn,to produce,HSK 5
生动,shēngdòng,vivid,HSK 5
生长,shēngzhǎng,to grow,HSK 5
声调,shēngdiào,tone,HSK 5
绳子,shéngzi,rope,HSK 5
省略,shěnglüè,to omit,HSK 5
胜利,shènglì,victory,HSK 5
诗,shī,poem,HSK 5
失眠,shīmián,to suffer from insomnia,HSK 5
失去,shīqù,to lose,HSK 5
失业,shīyè,to be unemployed,HSK 5
时代,shídài,era,HSK 5
时刻,shíkè,moment,HSK 5
时髦,shímáo,fashionable,HSK 5
时期,shíqī,period,HSK 5
时尚,shíshàng,fashion,HSK 5
实话,shíhuà,truth,HSK 5
实践,shíjiàn,practice,HSK 5
实习,shíxí,to practice,HSK 5
实现,shíxiàn,to realize,HSK 5
实验,shíyàn,experiment,HSK 5
实用,shíyòng,practical,HSK 5
食物,shíwù,food,HSK 5
石头,shítou,stone,HSK 5
使劲儿,shǐjìnr,to exert all one's strength,HSK 5
始终,shǐzhōng,from beginning to end,HSK 5
士兵,shìbīng,soldier,HSK 5
市场,shìchǎng,market,HSK 5
似的,shìde,as if,HSK 5
事实,shìshí,fact,HSK 5
事物,shìwù,thing,HSK 5
事先,shìxiān,in advance,HSK 5
试卷,shìjuàn,examination paper,HSK 5
收获,shōuhuò,harvest,HSK 5
收据,shōujù,receipt,HSK 5
手工,shǒugōng,handmade,HSK 5
手术,shǒushù,operation,HSK 5
手套,shǒutào,glove,HSK 5
手续,shǒuxù,procedure,HSK 5
手指,shǒuzhǐ,finger,HSK 5
寿命,shòumìng,lifespan,HSK 5
受伤,shòushāng,to be injured,HSK 5
书架,shūjià,bookshelf,HSK 5
输入,shūrù,to input,HSK 5
蔬菜,shūcài,vegetable,HSK 5
舒适,shūshì,comfortable,HSK 5
梳子,shūzi,comb,HSK 5
熟练,shúliàn,skilled,HSK 5
属于,shǔyú,to belong to,HSK 5
鼠标,shǔbiāo,mouse (computer),HSK 5
数,shù,number,HSK 5
数据,shùjù,data,HSK 5
数码,shùmǎ,digital,HSK 5
摔,shuāi,to fall,HSK 5
甩,shuǎi,to throw,HSK 5
双方,shuāngfāng,both sides,HSK 5
税,shuì,tax,HSK 5
说不定,shuōbudìng,perhaps,HSK 5
说法,shuōfǎ,way of saying a thing,HSK 5
丝绸,sīchóu,silk,HSK 5
丝毫,sīháo,the slightest amount,HSK 5
私人,sīrén,private,HSK 5
思考,sīkǎo,to think,HSK 5
思想,sīxiǎng,thought,HSK 5
撕,sī,to tear,HSK 5
寺庙,sìmiào,temple,HSK 5
似乎,sìhū,as if,HSK 5
宿舍,sùshè,dormitory,HSK 5
随身,suíshēn,(to carry) on one's person,HSK 5
随时,suíshí,at any time,HSK 5
随手,suíshǒu,conveniently,HSK 5
碎,suì,broken,HSK 5
损失,sǔnshī,loss,HSK 5
缩短,suōduǎn,to shorten,HSK 5
所,suǒ,place,HSK 5
所谓,suǒwèi,so-called,HSK 5
锁,suǒ,lock,HSK 5
台阶,táijiē,steps,HSK 5
太极拳,tàijíquán,tai chi,HSK 5
太太,tàitai,Mrs.,HSK 5
谈判,tánpàn,to negotiate,HSK 5
坦率,tǎnshuài,frank,HSK 5
烫,tàng,to scald,HSK 5
桃,táo,peach,HSK 5
逃,táo,to escape,HSK 5
逃避,táobì,to escape,HSK 5
套,tào,set,HSK 5
特殊,tèshū,special,HSK 5
特意,tèyì,specially,HSK 5
特征,tèzhēng,characteristic,HSK 5
疼爱,téng'ài,to love dearly,HSK 5
提倡,tíchàng,to advocate,HSK 5
提纲,tígāng,outline,HSK 5
提问,tíwèn,to ask a question,HSK 5
题目,tímù,title,HSK 5
体会,tǐhuì,to know from experience,HSK 5
体贴,tǐtiē,considerate,HSK 5
体现,tǐxiàn,to embody,HSK 5
体验,tǐyàn,to experience,HSK 5
天空,tiānkōng,sky,HSK 5
天真,tiānzhēn,naive,HSK 5
调皮,tiáopí,naughty,HSK 5
调整,tiáozhěng,to adjust,HSK 5
挑战,tiǎozhàn,to challenge,HSK 5
通常,tōngcháng,usually,HSK 5
通讯,tōngxùn,communication,HSK 5
铜,tóng,copper,HSK 5
同时,tóngshí,at the same time,HSK 5
统一,tǒngyī,to unify,HSK 5
统治,tǒngzhì,to rule,HSK 5
痛苦,tòngkǔ,pain,HSK 5
痛快,tòngkuai,joyful,HSK 5
投资,tóuzī,to invest,HSK 5
透明,tòumíng,transparent,HSK 5
突出,tūchū,prominent,HSK 5
土地,tǔdì,land,HSK 5
土豆,tǔdòu,potato,HSK 5
吐,tù,to vomit,HSK 5
兔子,tùzi,rabbit,HSK 5
团,tuán,group,HSK 5
推辞,tuīcí,to decline,HSK 5
推广,tuīguǎng,to popularize,HSK 5
推荐,tuījiàn,to recommend,HSK 5
退,tuì,to retreat,HSK 5
退步,tuìbù,to regress,HSK 5
退休,tuìxiū,to retire,HSK 5
歪,wāi,crooked,HSK 5
外公,wàigōng,maternal grandfather,HSK 5
外交,wàijiāo,diplomacy,HSK 5
完美,wánměi,perfect,HSK 5
完善,wánshàn,to perfect,HSK 5
完整,wánzhěng,complete,HSK 5
玩具,wánjù,toy,HSK 5
万一,wànyī,just in case,HSK 5
王子,wángzǐ,prince,HSK 5
往返,wǎngfǎn,to go back and forth,HSK 5
危害,wēihài,to harm,HSK 5
威胁,wēixié,to threaten,HSK 5
微笑,wēixiào,to smile,HSK 5
违反,wéifǎn,to violate,HSK 5
维护,wéihù,to maintain,HSK 5
围巾,wéijīn,scarf,HSK 5
围绕,wéirào,to revolve around,HSK 5
唯一,wéiyī,only,HSK 5
尾巴,wěiba,tail,HSK 5
伟大,wěidà,great,HSK 5
委屈,wěiqu,to feel wronged,HSK 5
未必,wèibì,not necessarily,HSK 5
未来,wèilái,future,HSK 5
位于,wèiyú,to be located at,HSK 5
位置,wèizhi,position,HSK 5
胃,wèi,stomach,HSK 5
温暖,wēnnuǎn,warm,HSK 5
温柔,wēnróu,gentle and soft,HSK 5
文件,wénjiàn,document,HSK 5
文具,wénjù,stationery,HSK 5
文明,wénmíng,civilization,HSK 5
文学,wénxué,literature,HSK 5
闻,wén,to smell,HSK 5
吻,wěn,to kiss,HSK 5
稳定,wěndìng,stable,HSK 5
问候,wènhòu,to send regards,HSK 5
卧室,wòshì,bedroom,HSK 5
屋子,wūzi,room,HSK 5
无奈,wúnài,to have no alternative,HSK 5
无数,wúshù,countless,HSK 5
无所谓,wúsuǒwèi,to be indifferent,HSK 5
武术,wǔshù,martial arts,HSK 5
勿,wù,do not,HSK 5
物理,wùlǐ,physics,HSK 5
物质,wùzhì,matter,HSK 5
雾,wù,fog,HSK 5
吸取,xīqǔ,to absorb,HSK 5
吸收,xīshōu,to absorb,HSK 5
系,xì,department,HSK 5
系统,xìtǒng,system,HSK 5
细节,xìjié,detail,HSK 5
戏剧,xìjù,drama,HSK 5
瞎,xiā,blind,HSK 5
吓,xià,to scare,HSK 5
下载,xiàzǎi,to download,HSK 5
鲜艳,xiānyàn,bright-colored,HSK 5
显得,xiǎnde,to appear,HSK 5
显然,xiǎnrán,obvious,HSK 5
显示,xiǎnshì,to show,HSK 5
县,xiàn,county,HSK 5
现代,xiàndài,modern,HSK 5
现实,xiànshí,reality,HSK 5
现象,xiànxiàng,phenomenon,HSK 5
限制,xiànzhì,to restrict,HSK 5
相处,xiāngchǔ,to get along,HSK 5
相当,xiāngdāng,quite,HSK 5
相对,xiāngduì,relatively,HSK 5
相关,xiāngguān,related,HSK 5
相似,xiāngsì,similar,HSK 5
香肠,xiāngcháng,sausage,HSK 5
享受,xiǎngshòu,to enjoy,HSK 5
想念,xiǎngniàn,to miss,HSK 5
想象,xiǎngxiàng,to imagine,HSK 5
项,xiàng,item,HSK 5
项链,xiàngliàn,necklace,HSK 5
项目,xiàngmù,project,HSK 5
象棋,xiàngqí,Chinese chess,HSK 5
象征,xiàngzhēng,to symbolize,HSK 5
消费,xiāofèi,to consume,HSK 5
消化,xiāohuà,to digest,HSK 5
消灭,xiāomiè,to eliminate,HSK 5
消失,xiāoshī,to disappear,HSK 5
销售,xiāoshòu,to sell,HSK 5
小气,xiǎoqi,stingy,HSK 5
孝顺,xiàoshùn,filial piety,HSK 5
效率,xiàolǜ,efficiency,HSK 5
歇,xiē,to rest,HSK 5
斜,xié,oblique,HSK 5
协调,xiétiáo,to coordinate,HSK 5
心理,xīnlǐ,psychology,HSK 5
心脏,xīnzàng,heart,HSK 5
欣赏,xīnshǎng,to appreciate,HSK 5
信号,xìnhào,signal,HSK 5
信任,xìnrèn,to trust,HSK 5
行动,xíngdòng,action,HSK 5
行人,xíngrén,pedestrian,HSK 5
行为,xíngwéi,behavior,HSK 5
形成,xíngchéng,to form,HSK 5
形容,xíngróng,to describe,HSK 5
形式,xíngshì,form,HSK 5
形势,xíngshì,situation,HSK 5
形象,xíngxiàng,image,HSK 5
形状,xíngzhuàng,shape,HSK 5
幸亏,xìngkuī,fortunately,HSK 5
幸运,xìngyùn,lucky,HSK 5
性质,xìngzhì,nature,HSK 5
兄弟,xiōngdì,brothers,HSK 5
胸,xiōng,chest,HSK 5
休闲,xiūxián,leisure,HSK 5
修改,xiūgǎi,to modify,HSK 5
虚心,xūxīn,modest,HSK 5
叙述,xùshù,to narrate,HSK 5
宣布,xuānbù,to announce,HSK 5
宣传,xuānchuán,to publicize,HSK 5
学历,xuélì,educational background,HSK 5
学术,xuéshù,academic,HSK 5
学问,xuéwen,knowledge,HSK 5
寻找,xúnzhǎo,to look for,HSK 5
询问,xúnwèn,to inquire,HSK 5
训练,xùnliàn,to train,HSK 5
迅速,xùnsù,rapid,HSK 5
押金,yājīn,deposit,HSK 5
牙齿,yáchǐ,tooth,HSK 5
延长,yáncháng,to prolong,HSK 5
严肃,yánsù,serious,HSK 5
演讲,yǎnjiǎng,speech,HSK 5
宴会,yànhuì,banquet,HSK 5
阳台,yángtái,balcony,HSK 5
痒,yǎng,to itch,HSK 5
样式,yàngshì,style,HSK 5
腰,yāo,waist,HSK 5
摇,yáo,to shake,HSK 5
咬,yǎo,to bite,HSK 5
要不,yàobù,otherwise,HSK 5
业务,yèwù,business,HSK 5
业余,yèyú,amateur,HSK 5
夜,yè,night,HSK 5
一辈子,yíbèizi,a lifetime,HSK 5
一旦,yídàn,once,HSK 5
一律,yílǜ,without exception,HSK 5
一再,yízài,repeatedly,HSK 5
一致,yízhì,unanimous,HSK 5
依然,yīrán,still,HSK 5
移动,yídòng,to move,HSK 5
移民,yímín,to immigrate,HSK 5
遗憾,yíhàn,regret,HSK 5
疑问,yíwèn,question,HSK 5
乙,yǐ,second,HSK 5
以及,yǐjí,as well as,HSK 5
以来,yǐlái,since,HSK 5
亿,yì,one hundred million,HSK 5
义务,yìwù,duty,HSK 5
议论,yìlùn,to discuss,HSK 5
意外,yìwài,unexpected,HSK 5
意义,yìyì,meaning,HSK 5
因而,yīn'ér,therefore,HSK 5
因素,yīnsù,factor,HSK 5
银,yín,silver,HSK 5
英俊,yīngjùn,handsome,HSK 5
英雄,yīngxióng,hero,HSK 5
迎接,yíngjiē,to welcome,HSK 5
营养,yíngyǎng,nutrition,HSK 5
营业,yíngyè,to do business,HSK 5
影子,yǐngzi,shadow,HSK 5
硬币,yìngbì,coin,HSK 5
硬件,yìngjiàn,hardware,HSK 5
拥抱,yōngbào,to embrace,HSK 5
拥挤,yōngjǐ,crowded,HSK 5
勇气,yǒngqì,courage,HSK 5
用途,yòngtú,use,HSK 5
优惠,yōuhuì,preferential,HSK 5
优美,yōuměi,graceful,HSK 5
优势,yōushì,advantage,HSK 5
悠久,yōujiǔ,long-standing,HSK 5
犹豫,yóuyù,to hesitate,HSK 5
油炸,yóuzhá,to deep-fry,HSK 5
游览,yóulǎn,to go sightseeing,HSK 5
有利,yǒulì,beneficial,HSK 5
幼儿园,yòuéryuán,kindergarten,HSK 5
娱乐,yúlè,entertainment,HSK 5
与其,yǔqí,rather than,HSK 5
语气,yǔqì,tone,HSK 5
玉米,yùmǐ,corn,HSK 5
预报,yùbào,to forecast,HSK 5
预订,yùdìng,to book,HSK 5
预防,yùfáng,to prevent,HSK 5
元旦,Yuándàn,New Year's Day,HSK 5
原料,yuánliào,raw material,HSK 5
原则,yuánzé,principle,HSK 5
愿望,yuànwàng,wish,HSK 5
晕,yūn,to be dizzy,HSK 5
运气,yùnqi,luck,HSK 5
运输,yùnshū,to transport,HSK 5
运用,yùnyòng,to use,HSK 5
灾害,zāihài,disaster,HSK 5
再三,zàisān,over and over again,HSK 5
在乎,zàihu,to care about,HSK 5
在于,zàiyú,to lie in,HSK 5
赞成,zànchéng,to approve of,HSK 5
赞美,zànměi,to praise,HSK 5
糟糕,zāogāo,terrible,HSK 5
造成,zàochéng,to cause,HSK 5
则,zé,then,HSK 5
责备,zébèi,to blame,HSK 5
摘,zhāi,to pick,HSK 5
窄,zhǎi,narrow,HSK 5
粘贴,zhāntiē,to paste,HSK 5
展开,zhǎnkāi,to unfold,HSK 5
展览,zhǎnlǎn,to exhibit,HSK 5
占,zhàn,to occupy,HSK 5
战争,zhànzhēng,war,HSK 5
涨,zhǎng,to rise,HSK 5
掌握,zhǎngwò,to grasp,HSK 5
账户,zhànghù,account,HSK 5
招待,zhāodài,to receive guests,HSK 5
着火,zháohuǒ,to catch fire,HSK 5
着凉,zháoliáng,to catch a cold,HSK 5
召开,zhàokāi,to convene,HSK 5
照常,zhàocháng,as usual,HSK 5
哲学,zhéxué,philosophy,HSK 5
针对,zhēnduì,to be directed against,HSK 5
珍惜,zhēnxī,to cherish,HSK 5
真实,zhēnshí,true,HSK 5
诊断,zhěnduàn,to diagnose,HSK 5
阵,zhèn,measure word for short period of time,HSK 5
振动,zhèndòng,to vibrate,HSK 5
睁,zhēng,to open (one's eyes),HSK 5
整个,zhěnggè,whole,HSK 5
整齐,zhěngqí,tidy,HSK 5
整体,zhěngtǐ,whole,HSK 5
正,zhèng,just,HSK 5
证件,zhèngjiàn,certificate,HSK 5
证据,zhèngjù,evidence,HSK 5
政府,zhèngfǔ,government,HSK 5
政治,zhèngzhì,politics,HSK 5
挣钱,zhèngqián,to earn money,HSK 5
支,zhī,measure word for stick-like things,HSK 5
支票,zhīpiào,check,HSK 5
执照,zhízhào,license,HSK 5
直,zhí,straight,HSK 5
指导,zhǐdǎo,to guide,HSK 5
指挥,zhǐhuī,to command,HSK 5
至今,zhìjīn,so far,HSK 5
至于,zhìyú,as for,HSK 5
志愿者,zhìyuànzhě,volunteer,HSK 5
制定,zhìdìng,to formulate,HSK 5
制度,zhìdù,system,HSK 5
制作,zhìzuò,to make,HSK 5
治疗,zhìliáo,to treat,HSK 5
秩序,zhìxù,order,HSK 5
智慧,zhìhuì,wisdom,HSK 5
中介,zhōngjiè,agent,HSK 5
中心,zhōngxīn,center,HSK 5
中旬,zhōngxún,middle of a month,HSK 5
种类,zhǒnglèi,kind,HSK 5
重大,zhòngdà,major,HSK 5
重量,zhòngliàng,weight,HSK 5
周到,zhōudào,thoughtful,HSK 5
猪,zhū,pig,HSK 5
竹子,zhúzi,bamboo,HSK 5
逐步,zhúbù,step by step,HSK 5
逐渐,zhújiàn,gradually,HSK 5
主持,zhǔchí,to preside over,HSK 5
主动,zhǔdòng,to take the initiative,HSK 5
主观,zhǔguān,subjective,HSK 5
主人,zhǔrén,master,HSK 5
主任,zhǔrèn,director,HSK 5
主题,zhǔtí,theme,HSK 5
主席,zhǔxí,chairman,HSK 5
主张,zhǔzhāng,to advocate,HSK 5
煮,zhǔ,to boil,HSK 5
注册,zhùcè,to register,HSK 5
祝福,zhùfú,to wish well,HSK 5
抓,zhuā,to grab,HSK 5
抓紧,zhuājǐn,to grasp firmly,HSK 5
专家,zhuānjiā,expert,HSK 5
专心,zhuānxīn,to concentrate,HSK 5
转变,zhuǎnbiàn,to change,HSK 5
转告,zhuǎngào,to pass on a message,HSK 5
装,zhuāng,to pretend,HSK 5
装饰,zhuāngshì,to decorate,HSK 5
装修,zhuāngxiū,to decorate,HSK 5
状况,zhuàngkuàng,condition,HSK 5
状态,zhuàngtài,state,HSK 5
追求,zhuīqiú,to pursue,HSK 5
资格,zīgé,qualification,HSK 5
资金,zījīn,fund,HSK 5
资料,zīliào,data,HSK 5
资源,zīyuán,resource,HSK 5
姿势,zīshì,posture,HSK 5
咨询,zīxún,to consult,HSK 5
紫,zǐ,purple,HSK 5
自从,zìcóng,since,HSK 5
自动,zìdòng,automatic,HSK 5
自豪,zìháo,proud,HSK 5
自觉,zìjué,conscious,HSK 5
自私,zìsī,selfish,HSK 5
自由,zìyóu,freedom,HSK 5
自愿,zìyuàn,voluntary,HSK 5
字幕,zìmù,subtitle,HSK 5
综合,zōnghé,comprehensive,HSK 5
总裁,zǒngcái,president,HSK 5
总共,zǒnggòng,altogether,HSK 5
总理,zǒnglǐ,premier,HSK 5
总算,zǒngsuàn,finally,HSK 5
总统,zǒngtǒng,president,HSK 5
总之,zǒngzhī,in short,HSK 5
阻止,zǔzhǐ,to prevent,HSK 5
组,zǔ,group,HSK 5
组成,zǔchéng,to form,HSK 5
组合,zǔhé,to combine,HSK 5
组织,zǔzhī,to organize,HSK 5
最初,zuìchū,at first,HSK 5
醉,zuì,drunk,HSK 5
尊敬,zūnjìng,to respect,HSK 5
遵守,zūnshǒu,to abide by,HSK 5
作品,zuòpǐn,work (of art),HSK 5
作为,zuòwéi,as,HSK 5
作文,zuòwén,composition,HSK 5
`;

/**
 * A simple CSV parser that handles quoted fields.
 * @param csvString The raw CSV string.
 * @returns An array of objects, one for each row.
 */
function parseCsvData(csvString: string): HskDataRow[] {
  const rows = csvString.trim().split('\n');
  const headers = rows.shift()?.split(',') ?? [];

  return rows.map((row, index) => {
    // This regex splits by comma, but ignores commas inside quotes.
    const values = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) ?? [];
    
    const rowData: { [key: string]: string } = {};
    headers.forEach((header, i) => {
      let value = values[i] || '';
      // Remove quotes if they exist
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      rowData[header.trim()] = value.trim();
    });

    return {
      hanza: rowData['Hanza'] || '',
      pinyin: rowData['Pinyin'] || '',
      english: rowData['English'] || '',
      hsk: rowData['HSK Level'] || '',
      id: index,
    };
  }).filter(row => row.hanza && row.english); // Ensure essential fields are present
}

/**
 * Uses the browser's SpeechSynthesis API to speak the given text in Chinese.
 * @param text The text to be spoken.
 */
function speak(text: string) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN'; // Specify Chinese (Mandarin, Mainland China)
    utterance.rate = 0.9; // Slightly slower for clarity
    window.speechSynthesis.speak(utterance);
  } else {
    console.error('Text-to-Speech is not supported in this browser.');
    // Optionally, alert the user that the feature is unavailable.
  }
}

/**
 * Creates and returns a single flashcard HTML element.
 * @param row The data for the flashcard.
 * @returns The HTMLDivElement for the flashcard.
 */
function createFlashcardElement(row: HskDataRow): HTMLDivElement {
  const cardDiv = document.createElement('div');
  cardDiv.classList.add('flashcard');
  cardDiv.dataset['index'] = row.id.toString();

  const cardInner = document.createElement('div');
  cardInner.classList.add('flashcard-inner');

  const cardFront = document.createElement('div');
  cardFront.classList.add('flashcard-front');

  const termDiv = document.createElement('div');
  termDiv.classList.add('term');
  
  const hanzaSpan = document.createElement('span');
  hanzaSpan.classList.add('hanza-text');
  hanzaSpan.textContent = row.hanza;
  termDiv.appendChild(hanzaSpan);

  if (row.hsk) {
      const hskSpan = document.createElement('span');
      hskSpan.classList.add('hsk-level-text');
      hskSpan.textContent = `(${row.hsk})`;
      termDiv.appendChild(hskSpan);
  }

  const cardBack = document.createElement('div');
  cardBack.classList.add('flashcard-back');

  const definitionDiv = document.createElement('div');
  definitionDiv.classList.add('definition');
  const pinyinText = row.pinyin ? `[${row.pinyin}]` : '';
  const backText = `${pinyinText}\n${row.english}`.trim();
  definitionDiv.textContent = backText;
  
  // Create and add the audio button to the back of the card
  const audioButton = document.createElement('button');
  audioButton.classList.add('audio-button');
  audioButton.setAttribute('aria-label', 'Play pronunciation');
  audioButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
  
  audioButton.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent the card from flipping
    speak(row.hanza);
  });

  cardFront.appendChild(termDiv);
  cardBack.appendChild(definitionDiv);
  cardBack.appendChild(audioButton);
  cardInner.appendChild(cardFront);
  cardInner.appendChild(cardBack);
  cardDiv.appendChild(cardInner);

  // Add click listener to toggle the 'flipped' class
  cardDiv.addEventListener('click', () => {
    if (!isDragging) {
      cardDiv.classList.toggle('flipped');
    }
  });

  return cardDiv;
}

/**
 * Displays the current flashcard based on the currentIndex.
 */
function renderCurrentCard() {
  flashcardViewer.innerHTML = '';
  errorMessage.textContent = '';
  isAnimating = false; // Reset animation lock

  if (currentDeck.length === 0) {
    navigationControls.style.visibility = 'hidden';
    // Check if any filter is active before showing the message
    const hasActiveFilter = Array.from(hskFilterButtons).some(btn => btn.getAttribute('aria-checked') === 'true');
    if (hasActiveFilter) {
      errorMessage.textContent = 'No matching entries found for the selected HSK level(s).';
    } else {
      errorMessage.textContent = 'Select an HSK level to begin.';
    }
    return;
  }
  
  navigationControls.style.visibility = 'visible';

  const row = currentDeck[currentIndex];
  const cardElement = createFlashcardElement(row);
  flashcardViewer.appendChild(cardElement);

  // Update counter
  cardCounter.textContent = `${currentIndex + 1} / ${currentDeck.length}`;

  // Update button states
  prevButton.disabled = currentIndex === 0;
  nextButton.disabled = currentIndex === currentDeck.length - 1;
  shuffleButton.disabled = currentDeck.length <= 1;
}

/**
 * Shuffles the current deck of flashcards and displays the first card.
 */
function shuffleDeck() {
  // Fisher-Yates shuffle algorithm
  for (let i = currentDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
  }
  currentIndex = 0;
  renderCurrentCard();
}

/**
 * Filters the main data set based on selected HSK levels and renders the first card.
 */
function updateDeckAndRender() {
  const selectedLevels = Array.from(hskFilterButtons)
    .filter(btn => btn.getAttribute('aria-checked') === 'true')
    .map(btn => btn.dataset.hskLevel);

  currentDeck = selectedLevels.length === 0
    ? allHskData
    : allHskData.filter(row => selectedLevels.includes(row.hsk));

  currentIndex = 0;
  renderCurrentCard();
}

/**
 * Handles the logic for animating and changing cards for both buttons and swipes.
 * @param direction 'next' or 'prev'
 */
function changeCard(direction: 'next' | 'prev') {
  if (isAnimating) return; // Prevent multiple navigations

  const canGoNext = currentIndex < currentDeck.length - 1;
  const canGoPrev = currentIndex > 0;
  
  if ((direction === 'next' && !canGoNext) || (direction === 'prev' && !canGoPrev)) {
    return;
  }

  isAnimating = true;
  const card = flashcardViewer.querySelector('.flashcard');
  const cardInner = flashcardViewer.querySelector('.flashcard-inner') as HTMLElement;

  if (!card || !cardInner) {
    isAnimating = false;
    return;
  }
  
  const isFlipped = card.classList.contains('flipped');
  // Set CSS variable for rotation, used by the animation keyframes
  cardInner.style.setProperty('--start-rotate', isFlipped ? '180deg' : '0deg');

  const animationClass = direction === 'next' ? 'is-exiting-left' : 'is-exiting-right';
  cardInner.classList.add(animationClass);

  cardInner.addEventListener('animationend', () => {
    if (direction === 'next') {
      currentIndex++;
    } else {
      currentIndex--;
    }
    renderCurrentCard(); // Creates a fresh card, resetting animations
  }, { once: true });
}


// --- Theme Management ---
/**
 * Applies the selected theme and saves it to localStorage.
 * @param theme The theme to apply ('light' or 'dark').
 */
function setTheme(theme: 'light' | 'dark') {
  const isDark = theme === 'dark';
  document.documentElement.classList.toggle('dark-mode', isDark);
  localStorage.setItem('theme', theme);
  themeToggleButton.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
}

/**
 * Initializes the theme based on user preference or system settings.
 */
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || savedTheme === 'light') {
    setTheme(savedTheme);
  } else {
    setTheme(prefersDark ? 'dark' : 'light');
  }
}

// --- Event Listeners ---

// Theme toggle
themeToggleButton.addEventListener('click', () => {
  const isDarkMode = document.documentElement.classList.contains('dark-mode');
  setTheme(isDarkMode ? 'light' : 'dark');
});


// HSK filter buttons
hskFilterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const isChecked = button.getAttribute('aria-checked') === 'true';
    button.setAttribute('aria-checked', isChecked ? 'false' : 'true');
    updateDeckAndRender();
  });
});

// Navigation
prevButton.addEventListener('click', () => changeCard('prev'));
nextButton.addEventListener('click', () => changeCard('next'));
shuffleButton.addEventListener('click', shuffleDeck);

// Swipe Gesture Logic
flashcardViewer.addEventListener('touchstart', (e) => {
  if (isAnimating || currentDeck.length === 0) return;
  const target = e.target as HTMLElement;
  if (!target.closest('.flashcard-inner')) return;

  isDragging = true;
  touchStartX = e.touches[0].clientX;
  currentTranslateX = 0;

  const cardInner = flashcardViewer.querySelector('.flashcard-inner');
  if (cardInner) {
    cardInner.classList.add('is-dragging');
  }
}, { passive: true });

flashcardViewer.addEventListener('touchmove', (e) => {
  if (!isDragging) return;

  const currentX = e.touches[0].clientX;
  currentTranslateX = currentX - touchStartX;
  const card = flashcardViewer.querySelector('.flashcard');
  const cardInner = flashcardViewer.querySelector('.flashcard-inner') as HTMLElement;
  
  if (card && cardInner) {
    const isFlipped = card.classList.contains('flipped');
    const rotateValue = isFlipped ? 180 : 0;
    // Move card with finger, preserving flip state
    cardInner.style.transform = `translateX(${currentTranslateX}px) rotateY(${rotateValue}deg)`;
  }
}, { passive: true });

flashcardViewer.addEventListener('touchend', () => {
  if (!isDragging) return;

  isDragging = false;
  const cardInner = flashcardViewer.querySelector('.flashcard-inner') as HTMLElement;
  if (!cardInner) return;

  cardInner.classList.remove('is-dragging');
  // Clear inline transform to allow CSS transitions/animations to take over
  cardInner.style.transform = ''; 

  if (Math.abs(currentTranslateX) > swipeThreshold) {
    // Successful swipe
    if (currentTranslateX < 0) {
      changeCard('next'); // Swipe left
    } else {
      changeCard('prev'); // Swipe right
    }
  }
  // If not a successful swipe, the card snaps back automatically
  // because the inline transform is removed and the default CSS takes over.
});

// Initial setup when the script loads
function main() {
  initializeTheme();
  allHskData = parseCsvData(csvData);
  // Initially, no deck is loaded until a user selects a filter.
  currentDeck = [];
  renderCurrentCard();
}

main();