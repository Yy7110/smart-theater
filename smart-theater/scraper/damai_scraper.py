"""
大麦网演出数据爬虫
爬取演出列表数据，保存为JSON供前端使用
仅用于个人学习研究用途
"""

import requests
import json
import time
import os
import random

class DamaiScraper:
    def __init__(self):
        self.session = requests.Session()
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://www.damai.cn/",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        }
        self.base_url = "https://search.damai.cn/searchajax.html"
        self.categories = {
            "演唱会": "ctl_yanchang",
            "话剧歌剧": "ctl_huaju",
            "音乐会": "ctl_yinyue",
            "舞蹈芭蕾": "ctl_wudao",
            "儿童亲子": "ctl_qinzi",
            "展览休闲": "ctl_zhanlan",
        }

    def fetch_shows(self, keyword="", city_id="", category="", page=1):
        """尝试从大麦网搜索接口获取演出数据"""
        params = {
            "keyword": keyword,
            "cty": city_id,
            "ctl": category,
            "sctl": "",
            "tsg": 0,
            "st": "",
            "et": "",
            "order": 4,
            "pageSize": 30,
            "currPage": page,
            "tn": "",
        }
        try:
            resp = self.session.get(
                self.base_url,
                params=params,
                headers=self.headers,
                timeout=10,
            )
            if resp.status_code == 200:
                data = resp.json()
                return data.get("pageData", {}).get("resultData", [])
        except Exception as e:
            print(f"[爬虫] 请求失败: {e}")
        return None

    def scrape_all(self):
        """爬取所有分类的演出数据"""
        all_shows = []
        for cat_name, cat_code in self.categories.items():
            print(f"[爬虫] 正在爬取分类: {cat_name}")
            results = self.fetch_shows(category=cat_code)
            if results:
                for item in results[:5]:
                    show = {
                        "id": item.get("projectid", ""),
                        "title": item.get("nameNoHtml", ""),
                        "category": cat_name,
                        "venue": item.get("venue", ""),
                        "city": item.get("cityname", ""),
                        "price": item.get("price_str", ""),
                        "image": item.get("verticalPic", ""),
                        "date": item.get("showtime", ""),
                        "description": item.get("description", ""),
                    }
                    all_shows.append(show)
            time.sleep(random.uniform(1, 3))
        return all_shows

    def save_data(self, shows, filepath="data/shows.json"):
        """保存数据到JSON文件"""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(shows, f, ensure_ascii=False, indent=2)
        print(f"[爬虫] 已保存 {len(shows)} 条演出数据到 {filepath}")


def generate_mock_data():
    """生成高质量模拟演出数据（当爬虫不可用时使用）"""
    shows = [
        {
            "id": "show-001",
            "title": "交响之夜 - 柏林爱乐乐团巡演",
            "category": "音乐会",
            "venue": "国家大剧院·音乐厅",
            "city": "北京",
            "price": "¥280-1680",
            "image": "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&q=80",
            "date": "2026-04-15 19:30",
            "artist": "柏林爱乐乐团",
            "description": "世界顶级交响乐团携手献上一场震撼心灵的音乐盛宴，演绎贝多芬与马勒的经典之作",
            "status": "热销中",
            "tags": ["古典音乐", "交响乐", "世界巡演"]
        },
        {
            "id": "show-002",
            "title": "《牡丹亭》- 昆曲经典复排",
            "category": "话剧歌剧",
            "venue": "国家大剧院·戏剧场",
            "city": "北京",
            "price": "¥180-980",
            "image": "https://images.unsplash.com/photo-1580809361436-42a7ec204889?w=800&q=80",
            "date": "2026-04-20 19:00",
            "artist": "国家昆剧院",
            "description": "六百年昆曲艺术的巅峰之作，用最古老的声腔讲述最动人的爱情故事",
            "status": "即将开售",
            "tags": ["昆曲", "经典", "非遗"]
        },
        {
            "id": "show-003",
            "title": "天鹅湖 - 莫斯科大剧院芭蕾舞团",
            "category": "舞蹈芭蕾",
            "venue": "上海大剧院",
            "city": "上海",
            "price": "¥380-2080",
            "image": "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&q=80",
            "date": "2026-04-25 19:30",
            "artist": "莫斯科大剧院芭蕾舞团",
            "description": "柴可夫斯基不朽名作，世界顶级芭蕾舞团倾情演绎白天鹅与黑天鹅的永恒传说",
            "status": "热销中",
            "tags": ["芭蕾", "经典", "世界巡演"]
        },
        {
            "id": "show-004",
            "title": "周杰伦「嘉年华」世界巡回演唱会",
            "category": "演唱会",
            "venue": "国家体育场(鸟巢)",
            "city": "北京",
            "price": "¥480-2880",
            "image": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
            "date": "2026-05-01 19:00",
            "artist": "周杰伦",
            "description": "华语乐坛天王携全新编排重磅回归，用音乐构建一座梦幻嘉年华",
            "status": "已售罄",
            "tags": ["流行", "演唱会", "天王"]
        },
        {
            "id": "show-005",
            "title": "宫崎骏动画交响音乐会",
            "category": "音乐会",
            "venue": "广州大剧院",
            "city": "广州",
            "price": "¥180-680",
            "image": "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&q=80",
            "date": "2026-05-10 15:00",
            "artist": "久石让音乐工作室",
            "description": "用交响乐重温吉卜力世界的每一个感动瞬间，穿越千与千寻的奇幻之旅",
            "status": "热销中",
            "tags": ["动漫", "交响乐", "亲子"]
        },
        {
            "id": "show-006",
            "title": "《哈姆雷特》- 英国皇家莎士比亚剧团",
            "category": "话剧歌剧",
            "venue": "深圳保利剧院",
            "city": "深圳",
            "price": "¥280-1280",
            "image": "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80",
            "date": "2026-05-15 19:30",
            "artist": "皇家莎士比亚剧团",
            "description": "莎翁四大悲剧之首，英国殿堂级剧团以当代视角重新诠释经典复仇悲剧",
            "status": "即将开售",
            "tags": ["话剧", "莎士比亚", "经典"]
        },
        {
            "id": "show-007",
            "title": "小王子 - 多媒体亲子舞台剧",
            "category": "儿童亲子",
            "venue": "杭州大剧院",
            "city": "杭州",
            "price": "¥120-480",
            "image": "https://images.unsplash.com/photo-1472457897821-70d000a64880?w=800&q=80",
            "date": "2026-05-18 10:30",
            "artist": "法国阳光剧团",
            "description": "法国经典童话搬上舞台，用光影与音乐带小朋友探索星球间的奇妙旅程",
            "status": "热销中",
            "tags": ["亲子", "童话", "多媒体"]
        },
        {
            "id": "show-008",
            "title": "「未来之境」沉浸式数字艺术展",
            "category": "展览休闲",
            "venue": "798艺术中心",
            "city": "北京",
            "price": "¥98-268",
            "image": "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=800&q=80",
            "date": "2026-04-01 ~ 2026-06-30",
            "artist": "teamLab",
            "description": "科技与艺术的完美碰撞，在光与影的世界中感受未来美学的无限可能",
            "status": "展出中",
            "tags": ["展览", "沉浸式", "数字艺术"]
        },
        {
            "id": "show-009",
            "title": "林俊杰「圣所3.0」演唱会",
            "category": "演唱会",
            "venue": "上海梅赛德斯奔驰文化中心",
            "city": "上海",
            "price": "¥380-2580",
            "image": "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
            "date": "2026-05-20 19:30",
            "artist": "林俊杰",
            "description": "实力唱将JJ Lin全新升级版演唱会，3D全息舞台打造极致视听体验",
            "status": "热销中",
            "tags": ["流行", "演唱会", "全息"]
        },
        {
            "id": "show-010",
            "title": "云门舞集《水月》",
            "category": "舞蹈芭蕾",
            "venue": "国家大剧院·歌剧院",
            "city": "北京",
            "price": "¥180-880",
            "image": "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&q=80",
            "date": "2026-06-01 19:30",
            "artist": "云门舞集",
            "description": "林怀民经典之作，太极导引与巴赫音乐的完美融合，东方美学的极致表达",
            "status": "即将开售",
            "tags": ["现代舞", "东方美学", "经典"]
        },
        {
            "id": "show-011",
            "title": "「赛博朋克2077」交响音乐会",
            "category": "音乐会",
            "venue": "成都城市音乐厅",
            "city": "成都",
            "price": "¥220-880",
            "image": "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80",
            "date": "2026-06-08 19:30",
            "artist": "游戏交响乐团",
            "description": "用交响乐重新演绎赛博朋克世界的电子之声，在古典与未来之间穿梭",
            "status": "热销中",
            "tags": ["游戏", "交响乐", "科幻"]
        },
        {
            "id": "show-012",
            "title": "《歌剧魅影》中文版",
            "category": "话剧歌剧",
            "venue": "上海文化广场",
            "city": "上海",
            "price": "¥280-1580",
            "image": "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&q=80",
            "date": "2026-06-15 19:00",
            "artist": "上海音乐剧艺术中心",
            "description": "百老汇传奇音乐剧首部中文版，地下迷宫中的爱与执念在东方舞台重生",
            "status": "即将开售",
            "tags": ["音乐剧", "百老汇", "经典"]
        },
        {
            "id": "show-013",
            "title": "薛之谦「天外来物」巡回演唱会",
            "category": "演唱会",
            "venue": "南京奥体中心",
            "city": "南京",
            "price": "¥380-1980",
            "image": "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80",
            "date": "2026-06-20 19:00",
            "artist": "薛之谦",
            "description": "用音乐丈量宇宙的距离，沉浸式舞美设计打造星际漫游般的视听盛宴",
            "status": "热销中",
            "tags": ["流行", "演唱会", "沉浸式"]
        },
        {
            "id": "show-014",
            "title": "《冰雪奇缘》梦幻冰上秀",
            "category": "儿童亲子",
            "venue": "武汉琴台大剧院",
            "city": "武汉",
            "price": "¥160-580",
            "image": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80",
            "date": "2026-06-25 14:00",
            "artist": "冰上演艺团",
            "description": "冰雪女王的魔法世界在真冰舞台上华丽绽放，适合全家共赏的梦幻体验",
            "status": "即将开售",
            "tags": ["亲子", "冰上秀", "迪士尼"]
        },
        {
            "id": "show-015",
            "title": "「无界」新媒体艺术大展",
            "category": "展览休闲",
            "venue": "西岸艺术中心",
            "city": "上海",
            "price": "¥128-328",
            "image": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80",
            "date": "2026-05-01 ~ 2026-08-31",
            "artist": "国际新媒体艺术联盟",
            "description": "汇聚全球12位新媒体艺术家的巅峰之作，在光影交织中打破艺术的边界",
            "status": "展出中",
            "tags": ["展览", "新媒体", "当代艺术"]
        },
        {
            "id": "show-016",
            "title": "维也纳新年音乐会精选",
            "category": "音乐会",
            "venue": "天津大剧院",
            "city": "天津",
            "price": "¥200-980",
            "image": "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80",
            "date": "2026-04-28 19:30",
            "artist": "维也纳施特劳斯管弦乐团",
            "description": "原汁原味的维也纳之声，施特劳斯家族经典圆舞曲与波尔卡的华丽盛宴",
            "status": "热销中",
            "tags": ["古典", "圆舞曲", "维也纳"]
        },
        {
            "id": "show-017",
            "title": "现代舞《永恒的回归》",
            "category": "舞蹈芭蕾",
            "venue": "广州大剧院",
            "city": "广州",
            "price": "¥160-680",
            "image": "https://images.unsplash.com/photo-1547153760-18fc86c12681?w=800&q=80",
            "date": "2026-07-05 19:30",
            "artist": "荷兰舞蹈剧场",
            "description": "欧洲当代舞蹈的先锋力量，用身体语言探讨时间、记忆与存在的哲学命题",
            "status": "即将开售",
            "tags": ["现代舞", "先锋", "哲学"]
        },
        {
            "id": "show-018",
            "title": "邓紫棋「启示录」世界巡演",
            "category": "演唱会",
            "venue": "深圳湾体育中心",
            "city": "深圳",
            "price": "¥380-2280",
            "image": "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
            "date": "2026-07-12 19:30",
            "artist": "邓紫棋",
            "description": "实力天后全新概念演唱会，融合电子与管弦乐的跨界音乐启示录",
            "status": "热销中",
            "tags": ["流行", "演唱会", "跨界"]
        }
    ];

    return shows


def main():
    scraper = DamaiScraper()

    print("=" * 50)
    print("智慧大剧院 - 大麦网数据爬虫")
    print("=" * 50)

    # 尝试爬取真实数据
    print("\n[1/2] 尝试从大麦网爬取数据...")
    shows = scraper.scrape_all()

    if not shows:
        print("[!] 爬取失败或无数据，使用模拟数据")
        shows = generate_mock_data()

    # 保存数据
    print(f"\n[2/2] 保存数据...")
    scraper.save_data(shows, "data/shows.json")

    print(f"\n{'=' * 50}")
    print(f"完成！共 {len(shows)} 条演出数据")
    print(f"数据文件: scraper/data/shows.json")
    print(f"{'=' * 50}")


if __name__ == "__main__":
    main()
