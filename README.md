# 唐天彪个人网站

这是一个无需后端的静态个人作品网站。当前版本完成了亮色首页、THEMIS/D1 固定机器人背景、五个项目概览，以及支持多图和视频的纵向项目叙事结构。

背景机器人素材位于 `assets/robots/`。网页当前使用透明背景版本 `agibot-d1-cutout.png`，原始版本 `agibot-d1.png` 仍然保留。

## 本地预览

在 `personal-portfolio` 目录运行：

```bash
python3 -m http.server 8080
```

然后打开 `http://127.0.0.1:8080`。

## 首页需要补充的五张封面图

把图片放入 `assets/projects/`，并严格使用以下文件名：

- `parls-gis-cover.jpg`：论文首页、算法框架或实验结果图
- `d1-navigation-cover.jpg`：Agibot D1 实机导航或 RViz 建图截图
- `dual-arm-can-cover.jpg`：人形机器人双臂、CAN 接线或轨迹回放照片
- `themis-simulation-cover.jpg`：THEMIS 的 Gazebo/RViz 仿真截图
- `shibei-app-cover.jpg`：拾贝 App 的手机界面组合图

推荐使用横向图片，比例约为 16:10，分辨率至少为 1600×1000。封面图会同时用于首页预览和项目展开页的主图。文件不存在时，网页会自动显示带文件名的占位框。

## 展开页的补充图片和视频

每个项目还预留了一张补充图片和一段演示视频：

- `parls-gis-02.jpg`、`parls-gis-demo.mp4`
- `d1-navigation-02.jpg`、`d1-navigation-demo.mp4`
- `dual-arm-can-02.jpg`、`dual-arm-can-demo.mp4`
- `themis-simulation-02.jpg`、`themis-simulation-demo.mp4`
- `shibei-app-02.jpg`、`shibei-app-demo.mp4`

这些媒体不是必须同时提供。以后也可以继续为单个项目增加图片或视频卡片。

## 当前交互原则

- 页面只通过纵向滚动浏览。
- 没有导航按钮、项目链接或卡片点击行为。
- 第一屏同时展示个人介绍和五个项目封面。
- 后续每个项目独占一屏。桌面端说明和媒体轮播左右交替，手机端上下排列。
- 图片与视频使用相同尺寸叠放；可点击露出的卡片或左右滑动切换，视频位于最前面时可直接播放。
- 对支持减少动态效果的设备，会自动关闭大部分动画。
